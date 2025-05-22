import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { MessageBubble } from '../../components/MessageBubble';
import { ChatInput } from '../../components/ChatInput';
import { generateResponse, Message, FileAttachment } from '../../services/api';
import { 
  Conversation, 
  saveConversation, 
  getConversation 
} from '../../utils/storage';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNewChat = id === 'new';
  const chatId = isNewChat ? uuidv4() : id;
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Load existing conversation if not a new chat
  useEffect(() => {
    if (!isNewChat) {
      loadConversation();
    } else {
      // For a new chat, create a new conversation object
      setConversation({
        id: chatId,
        title: 'New Chat',
        messages: [...messages],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }, [id]);

  const loadConversation = async () => {
    if (!id) return;
    
    const loadedConversation = await getConversation(id);
    if (loadedConversation) {
      setConversation(loadedConversation);
      setMessages(loadedConversation.messages);
    } else {
      // If conversation not found, redirect to conversations list
      Alert.alert('Error', 'Conversation not found');
      router.replace('/conversations');
    }
  };

  const handleSend = async (inputText: string, attachments?: FileAttachment[]) => {
    // Add user message to the chat
    const userMessage: Message = { 
      role: 'user', 
      content: inputText,
      attachments 
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Add a temporary loading message
    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...', isLoading: true }]);
    setIsLoading(true);
    
    try {
      // Call the Gemini API
      const response = await generateResponse(updatedMessages);
      
      // Update messages with the AI response
      const assistantMessage: Message = { role: 'assistant', content: response };
      const finalMessages = [...updatedMessages, assistantMessage];
      
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        assistantMessage
      ]);
      
      // Update conversation title for new chats
      let title = conversation?.title || 'New Chat';
      if (isNewChat && userMessage.content) {
        // Use first user message as the title (truncated)
        title = userMessage.content.length > 30
          ? `${userMessage.content.substring(0, 30)}...`
          : userMessage.content;
      }
      
      // Save conversation
      const updatedConversation: Conversation = {
        id: chatId,
        title,
        messages: finalMessages,
        createdAt: conversation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await saveConversation(updatedConversation);
      setConversation(updatedConversation);
      
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

  const handleBack = () => {
    router.push('/conversations');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>
          {conversation?.title || 'Chat'}
        </Text>
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color="#007AFF" 
            style={styles.loadingIndicator} 
          />
        )}
      </View>
      
      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
      </ScrollView>
      
      <ChatInput onSend={handleSend} onNewChat={loadConversation}/>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  loadingIndicator: {
    marginLeft: 16,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
});