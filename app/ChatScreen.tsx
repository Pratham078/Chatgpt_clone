import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { generateResponse, Message } from '../services/api';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-url-polyfill/auto';


export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (inputText: string) => {
    // Add user message to the chat
    const userMessage: Message = { role: 'user', content: inputText };
    setMessages([...messages, userMessage]);
    
    // Add a temporary loading message
    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...', isLoading: true }]);
    setIsLoading(true);
    
    try {
      // Call the Gemini API
      const response = await generateResponse([...messages, userMessage]);
      
      // Update messages with the AI response
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error communicating with API:', error);
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

    const handleNewChat = () => {
    setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerText}>AI Chat</Text>
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color="#007AFF" 
            style={styles.loadingIndicator} 
          />
        )}
      </View>
      <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/conversations')}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
      </TouchableOpacity>

      
      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
      </ScrollView>
      
      <ChatInput onSend={handleSend} onNewChat = {handleNewChat} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  historyButton: {
  position: 'absolute',
  right: 16,
  top: 16,
},
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
});