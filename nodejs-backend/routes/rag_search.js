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
const client = new OpenAI(headers);

const INDEX_NAME = 'files';

const OPENSEARCH_CONFIG = {
  //Challenge 1: Set the OpenSearch configuration parameters including host, port, username, and password
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
  //Challenge 2: frame the cosine similarity query to retrieve 3 documents with embeddings similar to the query embedding
  search_body = {

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

  //Challenge 3: Frame the prompt to include the query and the context in documents_string
  // OpenAI call
  const prompt = `Answer the question: ${searchQuery} based only on the following context. At the end also mention source from context:
  context:  ${documents_string}`;

  // Call OpenAI API
  //Challenge 4: Call the OpenAI API to get the search results
  const openaiResponse = {}
  const questions_text = openaiResponse.choices[0].message.content;
  res.send({ response: questions_text });

  res.send({ message: `Search results for: ${searchQuery}` });
});

module.exports = router;
