// Use OpenRouter API (OpenAI compatible)
async function callOpenRouter(messages, apiKey) {
  try {
    const apiUrl = 'https://openrouter.ai/api/v1';
    const model = process.env.LLM_MODEL || 'openrouter/auto';

    const systemPrompt = "You are Eventra's helpful AI assistant. You are friendly, knowledgeable, and can help with a wide range of topics including day-to-day life questions. While you specialize in helping with events, bookings, venues, and event planning on the Eventra platform, you can also answer general questions on any topic. Be conversational, helpful, and engaging. When relevant, encourage users to explore Eventra for event-related needs.";
    
    // Format messages for OpenRouter
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    console.log('[Chat] Calling OpenRouter API...');
    
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://eventra.app',
        'X-Title': 'Eventra Chat'
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response from OpenRouter API');
    }
    
    console.log('[Chat] ✅ OpenRouter API responded successfully');
    return text;
  } catch (error) {
    console.error('[Chat] OpenRouter API Error:', error.message);
    throw error;
  }
}

// Chat endpoint
exports.chat = async (req, res) => {
  try {
    const { messages = [] } = req.body;

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required and must not be empty',
      });
    }

    const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Chat service is not configured',
        detail: 'OPENROUTER_API_KEY is missing',
      });
    }

    // Call OpenRouter API directly - NO FALLBACK
    console.log('[Chat] Calling OpenRouter API...');
    const reply = await callOpenRouter(messages, apiKey);
    console.log('[Chat] ✅ Success! Got response from OpenRouter API');

    res.json({
      success: true,
      message: reply,
    });
  } catch (error) {
    console.error('[Chat] ❌ Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      detail: error.message || 'Failed to generate response',
    });
  }
};

// Mock responses for fallback/demo - COMMENTED OUT (User wants real AI only)
/*
function getMockResponse(userMessage) {
  const responses = {
    'event': 'We have amazing events coming up! You can explore events by category, date, or location. Would you like to find events in a specific category?',
    'booking': 'To book event tickets, simply go to the Explore section, find the event you like, and click "Book Now". You can pay securely using Razorpay.',
    'venue': 'We have premium venues available for rent. You can browse all venues in the Venues section and contact organizers directly.',
    'price': 'Event prices vary based on the type and duration. You can view specific pricing on each event\'s detail page.',
    'refund': 'Refund policies depend on the event organizer. Check the event details or contact support for specific information.',
    'cancel': 'You can cancel your booking from your profile. Please check the cancellation policy of the specific event.',
    'help': 'I\'m here to help! You can ask me about events, bookings, venues, pricing, or anything related to Eventra.',
    'chandigarh': 'Looking for events in Chandigarh? We have various events including concerts, tech meetups, sports events, and more! Check our Explore section to find upcoming events in Chandigarh.',
    'suggest': 'I can suggest various event ideas! For social events, consider concerts, food festivals, or art exhibitions. For professional growth, look into tech conferences or business networking events. What type of event interests you?',
    'hello': 'Hello! I\'m Eventra\'s AI assistant. How can I help you today?',
    'hi': 'Hi there! How can I assist you with events or general questions today?',
    'thanks': 'You\'re welcome! Feel free to ask me anything else!',
    'thank': 'You\'re welcome! Let me know if you need any other help.',
  };

  const lowerMessage = userMessage.toLowerCase();
  
  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // More conversational default response
  return 'I\'m here to help! You can ask me about Eventra events, bookings, venues, or general questions on any topic. What would you like to know?';
}
*/

// Health check endpoint
exports.health = (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  res.json({
    status: 'ok',
    chat: apiKey ? 'configured' : 'not configured',
  });
};

