const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Frontend')));

const port = process.env.PORT || 3000;

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const messages = [];
    if (Array.isArray(conversation)) messages.push(...conversation);
    messages.push({ role: 'user', content: message });

    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800
    });

    const reply = response?.data?.choices?.[0]?.message?.content || 'Sorry, no response';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

app.listen(port, () => console.log(`Chatbot running on http://localhost:${port}`));
