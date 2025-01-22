const express = require('express');
const router = express.Router();
const { getOpenAIClient } = require('../util');

// Endpoint to generate a question
router.get('/ask-question', async (req, res) => {
  const topic = req.query.topic;

  // Challenge 1.a - Write the prompt
  const prompt = ``;

  const client = await getOpenAIClient();
  // Challenge 1.b - Call OpenAI API to generate questions
  const response = {

  }

  // Extract the generated text
  const questions_text = response.choices[0].message.content;

  // Return the questions as a JSON response
  res.json({ question: questions_text });
});

// Endpoint to submit descriptive questions
router.post('/question-feedback', async (req, res) => {
  // Request parameter includes both question and answer provided by user.
  const { question, CandidateAnswer: answer } = req.body.question;

  // Challenge 2.a - Write Prompt to evaluate the question and answer
  // Use question and answer variable to generate the prompt
  const prompt = ``;

  // OpenAI Call to generate feedback
  const client = await getOpenAIClient();
  // Challenge 2.b - Call the OpenAI API and get the response
  const response = {
    
  }

  // Extract the generated text
  const feedback_text = response.choices[0].message.content;

  // Return the feedback as a JSON response
  res.json({ feedback: feedback_text });
});

module.exports = router;
