import express from 'express';
import cors from 'cors';

//define all routes
import askQuestionRouter from './routes/askquestion.js';
import descriptiveRouter from './routes/descriptive.js';
import mcqRouter from './routes/mcq.js';
import chatRouter from './routes/chat.js';
import ragSearchRouter from './routes/rag_search.js';
import ragUploadFilesRouter from './routes/rag_uploadfiles.js';

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
