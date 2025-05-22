import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../services/api';
import { FileAttachmentView } from './FileAttachment';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <View 
      style={[
        styles.messageBubble,
        isUser ? styles.userMessage : styles.assistantMessage,
        message.isLoading && styles.loadingMessage
      ]}
    >
      <Text style={[
        styles.messageText, 
        isUser && styles.userMessageText
      ]}>
        {message.content}
      </Text>
      {message.attachments?.map((attachment, index) => (
        <FileAttachmentView key={index} attachment={attachment} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  loadingMessage: {
    backgroundColor: '#E5E5EA',
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
});