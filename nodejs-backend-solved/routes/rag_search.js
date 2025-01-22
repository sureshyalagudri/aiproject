const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateToken } = require('../util');
const { v4: uuidv4 } = require('uuid');
const {generate_embeddings} = require('./rag_uploadfiles')
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');
const { OpenAI } = require("@langchain/openai");
const { Document } = require("langchain/document");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { OpenSearchVectorStore } = require("@langchain/community/vectorstores/opensearch");


require('dotenv').config();
(async () => {
  await generateToken();
})();


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

// Endpoint to search
router.post('/search', async (req, res) => {
  const searchQuery = req.body.query;
  

  const vectorStore = new OpenSearchVectorStore(new OpenAIEmbeddings(model="text-embedding-3-large", dimensions=256), {
    client: opensearchClient,
  });
  
  /* Search the vector DB independently with meta filters */
  const results = await vectorStore.similaritySearch(searchQuery, 1, dimensions=256, {  });
  const client = new OpenAI();

  res.send({ message: `Search results for: ${searchQuery}` });
});

module.exports = router;
