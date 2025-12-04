import 'dotenv/config';

const KOLOSAL_API_URL = 'https://api.kolosal.ai/v1/chat/completions';
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY;

/**
 * Send a chat completion request to Kolosal AI
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - AI response
 */
export async function sendChatCompletion(messages, options = {}) {
  const {
    model = 'Claude Sonnet 4.5',
    temperature = 0.7,
    maxTokens = 1000,
    ...otherOptions
  } = options;

  if (!KOLOSAL_API_KEY) {
    throw new Error('KOLOSAL_API_KEY is not configured in environment variables');
  }

  const requestBody = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...otherOptions,
  };

  try {
    const response = await fetch(KOLOSAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KOLOSAL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Kolosal AI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Kolosal AI:', error);
    throw error;
  }
}

/**
 * Send a simple text prompt to AI
 * @param {string} prompt - User prompt
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - AI response content
 */
export async function chat(prompt, options = {}) {
  const messages = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await sendChatCompletion(messages, options);
  return response.choices?.[0]?.message?.content || '';
}

/**
 * Send a conversation with system prompt
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User message
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - AI response content
 */
export async function chatWithSystem(systemPrompt, userPrompt, options = {}) {
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userPrompt,
    },
  ];

  const response = await sendChatCompletion(messages, options);
  return response.choices?.[0]?.message?.content || '';
}

/**
 * Continue a conversation with history
 * @param {Array} conversationHistory - Array of previous messages
 * @param {string} newMessage - New user message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - AI response with full data
 */
export async function continueConversation(conversationHistory, newMessage, options = {}) {
  const messages = [
    ...conversationHistory,
    {
      role: 'user',
      content: newMessage,
    },
  ];

  const response = await sendChatCompletion(messages, options);
  return {
    content: response.choices?.[0]?.message?.content || '',
    fullResponse: response,
    updatedHistory: [...messages, response.choices?.[0]?.message],
  };
}

export default {
  sendChatCompletion,
  chat,
  chatWithSystem,
  continueConversation,
};
