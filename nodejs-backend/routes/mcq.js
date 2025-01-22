import express from 'express';
import { generateToken } from '../util.js';
import { OpenAI  } from 'openai';

const router = express.Router();
await generateToken();

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

  //challenge 1 - create a schema for the multiple choice question
  const questionSchema = {
   
  };

  const client = await OpenAI();
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

  //challenge 2 - Write prompt to evaluate the question and answer
  const prompt = ``;

  const client = await OpenAI();
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

export default router;