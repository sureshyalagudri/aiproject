const express = require('express');
const router = express.Router();
const { generateToken } = require('../util');
const { OpenAI } = require('openai');

(async () => {
  await generateToken();
})();

const header_name = process.env.GATEWAY_HEADER_NAME
const header_value = process.env.GATEWAY_HEADER_VALUE
const headers = {
  header_name: header_value,
};
const client = new OpenAI(headers);

// Endpoint to generate descriptive questions
router.get('/generate-questions', async (req, res) => {
  const topic = req.query.topic;

  // Challenge 1.a - Write a prompt as in requirement document. Use {topic} variable to include the topic in the prompt
  const prompt = `Create 3 challenging ${topic} interview questions with concise, ideal answers (1-2 sentences). Output in JSON format using this schema:\n\n` +
    `[\n` +
    `  {\n` +
    `    "Id": "Question Number",\n` +
    `    "Question": "Question text",\n` +
    `    "ExpectedAnswer": "Ideal answer"\n` +
    `  }\n` +
    `]`;

  const client = await new OpenAI();
  // Challenge 1.b - Call OpenAI API to generate questions using prompt variable
  const response = await client.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an expert in technical interviews, generating relevant questions with concise (1-2 sentence) answers. Output must be in valid JSON format as specified by the user."
          }
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ],
  });

  // Extract the generated text and convert it to JSON
  const questions_text = response.choices[0].message.content;

  // Challenge 1.c - Remove extra characters from response if present
  const questions_json_str = questions_text.trim().replace(/^```json|```$/g, '');

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
  const prompt = `Evaluate the following candidate's answers to technical interview questions and provide: \n\n` +
    `* An overall rating out of 10. \n` +
    `* Specific feedback on each answer, highlighting strengths and weaknesses \n` +
    `JSON Data: ${user_message}`;

  const client = new OpenAI();
  // Challenge 2.b - Call the OpenAI API and get the response
  const feedback_response = await client.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an expert in technical interviews, evaluating the given answers. Provide feedback for each answer in tabular format"
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ],
  });

  // Extract the generated text
  const feedback_text = feedback_response.choices[0].message.content;

  // Return the feedback as a JSON response
  res.json({ feedback: feedback_text });
});

module.exports = router;