const express = require('express');
const router = express.Router();
const { generateToken } = require('../util');
const { OpenAI } = require('openai');

(async () => {
  await generateToken();
})();


// Endpoint for chat
router.post('/chat', async (req, res) => {
  const { query, messages } = req.body;

  if (!query) {
    return res.status(400).json({ detail: "Query cannot be empty" });
  }

  try {
    const header_name = process.env.GATEWAY_HEADER_NAME
    const header_value = process.env.GATEWAY_HEADER_VALUE
    const headers = {
      header_name: header_value,
    };
    const client = new OpenAI(headers);

    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: messages,
      temperature: 0.7
    });

    const assistant_message = response.choices[0].message.content;
    messages.push({ role: "system", content: assistant_message });

    return res.json({ messages: messages });
  } catch (e) {
    return res.status(500).json({ detail: `Failed to generate response: ${e.message}` });
  }
});

module.exports = router;
