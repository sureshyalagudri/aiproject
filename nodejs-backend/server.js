const express = require('express');
const cors = require('cors');

//define all routes
const askQuestionRouter = require('./routes/askquestion');
const descriptiveRouter = require('./routes/descriptive');
const mcqRouter = require('./routes/mcq');
const chatRouter = require('./routes/chat');
const ragSearchRouter = require('./routes/rag_search');
const ragUploadFilesRouter = require('./routes/rag_uploadfiles');

const app = express();
app.use(cors()); // Enable CORS from all domains
app.use(express.json()); // Middleware to parse JSON bodies

app.use('/', askQuestionRouter);
app.use('/', descriptiveRouter);
app.use('/', mcqRouter);
app.use('/', ragUploadFilesRouter);
app.use('/', chatRouter);
app.use('/', ragSearchRouter);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
