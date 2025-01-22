import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateToken } from '../util.js';
import { v4 as uuidv4 } from 'uuid';
import { generate_embeddings } from './rag_uploadfiles.js';
import { Client as OpenSearchClient } from '@opensearch-project/opensearch';
import { OpenAI } from "@langchain/openai";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenSearchVectorStore } from "@langchain/community/vectorstores/opensearch";

const router = express.Router();
await generateToken();

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
  const client = await OpenAI();
  const prompt = '';
  //Challenge 4: Call the OpenAI API to get the search results
  const response = {};
  const response_str = response.choices[0].message.content;

  res.send({ response: response_str });
});

export default router;