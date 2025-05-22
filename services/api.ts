/**
 * Gemini API service to handle API requests to the Gemini API
 */

// Replace with your actual API key
const API_KEY = "";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface FileAttachment {
  type: 'file' | 'image';
  name: string;
  uri: string;
  mimeType: string;
  size: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isLoading?: boolean;
  attachments?: FileAttachment[];
}

export async function generateResponse(messages: Message[]): Promise<string> {
  try {
    // Format messages for Gemini API
    const formattedMessages = messages.filter(msg => !msg.isLoading).map(msg => {
      return {
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      };
    });

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.error?.message || 'Failed to generate response');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}