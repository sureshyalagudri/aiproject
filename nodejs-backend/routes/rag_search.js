const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getOpenAIClient } = require('../util');
const { v4: uuidv4 } = require('uuid');
const {generate_embeddings} = require('./rag_uploadfiles')
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');
const { OpenAI } = require("@langchain/openai");
const { Document } = require("langchain/document");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { OpenSearchVectorStore } = require("@langchain/community/vectorstores/opensearch");


require('dotenv').config();

const INDEX_NAME = 'files';

const OPENSEARCH_CONFIG = {
  // #Challenge 1: Set the OpenSearch configuration parameters including host, port, username, and password
};

const opensearchClient = new OpenSearchClient(OPENSEARCH_CONFIG);

// Endpoint to search
router.post('/search', async (req, res) => {
  const searchQuery = req.body.query;
  

  const vectorStore = new OpenSearchVectorStore(new OpenAIEmbeddings(model="text-embedding-3-large", dimensions=256), {
    client: opensearchClient,
  });
  
  /* Search the vector DB independently with meta filters */
  //Challenge 2: frame the query to retrieve 3 documents with embeddings similar to the query embedding
  const results = [];
  //Challenge 3: Frame the prompt to include the query and the context in documents_string
  const client = await getOpenAIClient();
  const prompt = '';
  //Challenge 4: Call the OpenAI API to get the search results
  const response = {};
  const response_str = response.choices[0].message.content;

  res.send({ response: response_str });
});

module.exports = router;
