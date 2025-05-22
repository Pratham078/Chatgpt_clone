import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { FileAttachment } from '../services/api';

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  onNewChat: () => void;
}

export function ChatInput({ onSend, onNewChat }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  const handleSend = () => {
    if (input.trim() === '' && attachments.length === 0) return;
    onSend(input.trim(), attachments);
    setInput('');
    setAttachments([]);
  };

  const handleNewChat = () => {
    onNewChat();
    setInput('');
    setAttachments([]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      const fileName = asset.uri.split('/').pop() || 'image.jpg';
      
      setAttachments([...attachments, {
        type: 'image',
        name: fileName,
        uri: asset.uri,
        mimeType: 'image/jpeg',
        size: fileInfo.exists ? fileInfo.size : 0,
      }]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setAttachments([...attachments, {
          type: 'file',
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        }]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.plusButton} onPress={handleNewChat}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.attachmentButtons}>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
            <Ionicons name="document-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton} onPress={() => router.push('/camera')}>
            <Ionicons name="camera-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline
        />
        
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={input.trim() === '' && attachments.length === 0}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={(input.trim() === '' && attachments.length === 0) ? '#CCCCCC' : '#007AFF'} 
          />
        </TouchableOpacity>
      </View>
      
      {attachments.length > 0 && (
        <View style={styles.attachmentPreview}>
          {attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <Ionicons 
                name={attachment.type === 'image' ? 'image-outline' : 'document-outline'} 
                size={20} 
                color="#666666" 
              />
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.name}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setAttachments(attachments.filter((_, i) => i !== index));
                }}
              >
                <Ionicons name="close-circle" size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  plusButton: {
    marginRight: 8,
    padding: 8,
    borderRadius: 20,
  },
  attachmentButtons: {
    flexDirection: 'row',
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    backgroundColor: '#F7F7F7',
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
  },
  attachmentPreview: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  attachmentName: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 12,
    color: '#666666',
  },
});