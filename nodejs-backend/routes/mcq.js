const express = require('express');
const router = express.Router();
const { generateToken } = require('../util');
const { OpenAI } = require('openai');

(async () => {
  await generateToken();
})();


// Endpoint to generate MCQ questions
router.post('/mcq/generate', async (req, res) => {
  const { topic, complexity, messages } = req.body;

  const defaultMessages = [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: "You are a technical interviewer creating technical multiple-choice questions. Generate one question with a specified complexity level (Basic, Intermediate, or Advanced)."
        }
      ]
    }
  ];

  const prompt = `Create ${topic} Multiple choice interview question with complexity level: ${complexity}.`;
  const userMessage = { role: "user", content: [{ type: "text", text: prompt }] };

  const finalMessages = messages ? messages.concat(userMessage) : defaultMessages.concat(userMessage);

  const questionSchema = {
    // Challenge1: Write the Schema for the multiple choice question as given in specification
  };

  const header_name = process.env.GATEWAY_HEADER_NAME
  const header_value = process.env.GATEWAY_HEADER_VALUE
  const headers = {
    header_name: header_value,
  };
  const client = new OpenAI(headers);

  const response = await client.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    temperature: 0.5,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "multiple_choice_question",
        strict: true,
        schema: questionSchema
      }
    },
    messages: finalMessages
  });

  const questionsText = response.choices[0].message.content;
  const questions = JSON.parse(questionsText);
  const assistantMessage = { role: "assistant", content: [{ type: "text", text: questionsText }] };
  finalMessages.push(assistantMessage);

  res.json({ messages: finalMessages, currentQuestion: questions });
});

// Endpoint to submit MCQ answers
router.post('/mcq/submit', async (req, res) => {
  const data = req.body;
  const userMessage = JSON.stringify(data);
  // Challenge2: Evaluate the candidate's answers to multiple-choice questions
  const prompt = ``;

  const client = new OpenAI();
  const feedbackResponse = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an expert in evaluating multiple-choice questions. Provide feedback for each answer."
          }
        ]
      },
      { role: "user", content: [{ type: "text", text: prompt }] }
    ]
  });

  const feedbackText = feedbackResponse.choices[0].message.content;

  res.json({ feedback: feedbackText });
});

module.exports = router;