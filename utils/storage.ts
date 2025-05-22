import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../services/api';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const CONVERSATIONS_KEY = 'ai_chat_conversations';

export async function saveConversation(conversation: Conversation): Promise<void> {
  try {
    // Get existing conversations
    const existingConversationsJSON = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    const existingConversations: Conversation[] = existingConversationsJSON 
      ? JSON.parse(existingConversationsJSON) 
      : [];
    
    // Find if conversation already exists
    const existingIndex = existingConversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      // Update existing conversation
      existingConversations[existingIndex] = {
        ...conversation,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new conversation
      existingConversations.push({
        ...conversation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Save back to storage
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(existingConversations));
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

export async function getConversations(): Promise<Conversation[]> {
  try {
    const conversationsJSON = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return conversationsJSON ? JSON.parse(conversationsJSON) : [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

export async function getConversation(id: string): Promise<Conversation | null> {
  try {
    const conversations = await getConversations();
    return conversations.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
}

export async function deleteConversation(id: string): Promise<void> {
  try {
    const conversations = await getConversations();
    const filteredConversations = conversations.filter(c => c.id !== id);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filteredConversations));
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}