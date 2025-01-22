const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Readable } = require('stream');
const { Client: OpenSearchClient } = require('@opensearch-project/opensearch');
const { generateToken } = require('../util');
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();
(async () => {
  await generateToken();
})();


const upload = multer();
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

async function generate_embeddings(texts) {
  const client = new OpenAI();
  const response = await client.embeddings.create({
    input: texts,
    model: 'text-embedding-3-large',
    dimensions: 256
  });
  return response.data.map(item => item.embedding);
}

async function insert_documents(search_client, fileChunks, embeddings, fileMetadata) {
  const documents = fileChunks.map((content, i) => ({
    index: {
      _index: INDEX_NAME,
      _id: uuidv4(),
      _source: {
        name: path.basename(fileMetadata[i].source),
        content,
        embedding: embeddings[i],
      },
    },
  }));
  const { body: success } = await search_client.helpers.bulk({
    index: INDEX_NAME, // the default index
    datasource: documents,
    onDocument (doc) {
      return {
        index: { _index: INDEX_NAME }
      }
    }
  });
  console.log(`Successfully inserted ${success.items.length} documents into OpenSearch.`);
}

async function retrieve_all_documents(client) {
  const search_body = {
    size: 1000,
    // _source: ["name", "content", "embedding"],
    query: { match_all: {} },
  };
  const { body: response } = await client.search({ index: INDEX_NAME, body: search_body });
  return response;
}

router.get('/rag/files', async (req, res) => {
  try {
    const client = new OpenSearchClient({
     ...OPENSEARCH_CONFIG,
    });

    const search_results = await retrieve_all_documents(client);
    const sources = [...new Set(search_results.hits.hits.map(hit =>hit._source.index._source.name))];
    res.json({ sources });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/rag/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file || !file.originalname.endsWith('.pdf')) {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  try {
    const pdf_stream = new Readable();
    pdf_stream.push(file.buffer);
    pdf_stream.push(null);

    const filenamewithoutExt = path.basename(file.originalname, path.extname(file.originalname));
    const safe_filename = filenamewithoutExt.replace(/[^a-z0-9-_]/gi, '_') + '.pdf';
    const temp_path = path.join(os.tmpdir(), safe_filename);

    fs.writeFileSync(temp_path, pdf_stream.read());

    try {
      const loader = new PDFLoader(temp_path);
      const text_content = await loader.load();

      const pages_content = text_content.map(t => t.pageContent);
      const pages_metadata_content = text_content.map(t => t.metadata);

      const embeddings = await generate_embeddings(pages_content);
      const opensearchClient = new OpenSearchClient(OPENSEARCH_CONFIG);
      await insert_documents(opensearchClient, pages_content, embeddings, pages_metadata_content);
    } finally {
      fs.unlinkSync(temp_path);
    }

    res.json({
      message: 'File uploaded and processed successfully',
      filename: file.originalname,
      size: file.size,
      text_length: text_content.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;