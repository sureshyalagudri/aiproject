const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateToken } = require('../util');
const { v4: uuidv4 } = require('uuid');
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');
const { OpenAI } = require('openai');
const { Document } = require("langchain/document");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { OpenSearchVectorStore } = require("@langchain/community/vectorstores/opensearch");


require('dotenv').config();
(async () => {
  await generateToken();
})();

const header_name = process.env.GATEWAY_HEADER_NAME
const header_value = process.env.GATEWAY_HEADER_VALUE
const headers = {
    header_name: header_value,
};
const openAIClient = new OpenAI(headers);

const INDEX_NAME = 'files';

const OPENSEARCH_CONFIG = {
  node: `https://${process.env.OPENSEARCH_HOST}:${process.env.OPENSEARCH_PORT}`,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
  ssl: {
    rejectUnauthorized: false,
  },
};

const opensearchClient = new OpenSearchClient(OPENSEARCH_CONFIG);

 async function generate_embeddings(texts) {
  const response = await openAIClient.embeddings.create({
    input: texts,
    model: 'text-embedding-3-large',
    dimensions: 256
  });
  return response.data.map(item => item.embedding);
}

// Endpoint to search
router.post('/search', async (req, res) => {
  const searchQuery = req.body.query;
  // Generate embeddings for the search query
  const query_embedding = await generate_embeddings([searchQuery]);
  
  search_body = {
    "size": 3, 
    "_source": [
        "name",
        "content"
      
    ],  
    "query": {
   "script_score": {
     "query": {
       "match_all": {}
     },
     "script": {
       "source": "knn_score",
       "lang": "knn",
       "params": {
         "field": "embedding",
         "query_value": query_embedding[0],
         "space_type": "cosinesimil",
         "k": 3
       }
     }
   }
 }
  }


  // Search for similar documents based on the query embedding
//Search for similar documents based on the query embedding
  response = await opensearchClient.search({
    index: INDEX_NAME, 
    body: search_body
  })
  // Extract documents and their embeddings
  let documents_string = "";
  // match_all query returns all documents, so we need to filter based on cosine similarity
  response.body.hits.hits.forEach(hit => {
    const doc = hit._source;
    documents_string += doc.content;
    documents_string += `\nSource: ${doc.name}\n\n`;
  });

  // OpenAI call
  const prompt = `Answer the question: ${searchQuery} based only on the following context. At the end also mention source from context:
  context:  ${documents_string}`;

  // Call OpenAI API
  const openaiResponse = await openAIClient.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    temperature: 1,  // Higher temperature can result in more creative responses apart from context 
    messages: [
      {
        role: "system",
        content: "You are an AI assistant tasked with answering questions using the provided context as the primary source of information.",
      },
      { role: "user", content: prompt },
    ],
  });

  const questions_text = openaiResponse.choices[0].message.content;
  res.send({ response: questions_text });

  res.send({ message: `Search results for: ${searchQuery}` });
});

module.exports = router;
