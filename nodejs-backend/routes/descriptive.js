import express from 'express';
import { generateToken } from '../util.js';
import { OpenAI  } from 'openai';

const router = express.Router();
await generateToken();

// Endpoint to generate descriptive questions
router.get('/generate-questions', async (req, res) => {
  const topic = req.query.topic;

  // Challenge 1.a - Write a prompt as in requirement document. Use {topic} variable to include the topic in the prompt
  const prompt = ''

  const client = await OpenAI();
  // Challenge 1.b - Call OpenAI API to generate questions using prompt variable
  const response = {}

  // Extract the generated text and convert it to JSON
  const questions_text = response.choices[0].message.content;

  // Challenge 1.c - Remove extra characters from response if present
  const questions_json_str = '';

  // Load the questions as JSON object from the text
  const questions_json = JSON.parse(questions_json_str);

  // Return the questions as a JSON response
  res.json({ questions: questions_json });
});

// Endpoint to submit descriptive questions
router.post('/submitdescriptivequestions', async (req, res) => {
  const data = req.body;
  const user_message = JSON.stringify(data);

  // Challenge 2.a - Write prompt to evaluate the question and answer
  const prompt = '';

  const client = await OpenAI();
  // Challenge 2.b - Call the OpenAI API and get the response
  const feedback_response = {}

  // Extract the generated text
  const feedback_text = feedback_response.choices[0].message.content;

  // Return the feedback as a JSON response
  res.json({ feedback: feedback_text });
});

export default router;