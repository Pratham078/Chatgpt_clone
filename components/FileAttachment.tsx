import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { FileAttachment } from '../services/api';

interface FileAttachmentProps {
  attachment: FileAttachment;
}

export function FileAttachmentView({ attachment }: FileAttachmentProps) {
  const handlePress = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(attachment.uri);
    } catch (error) {
      console.error('Error sharing file:', error);
      alert('Error sharing file');
    }
  };

  if (attachment.type === 'image') {
    return (
      <TouchableOpacity onPress={handlePress} style={styles.container}>
        <Image
          source={{ uri: attachment.uri }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageInfo}>
          <Text style={styles.fileName} numberOfLines={1}>{attachment.name}</Text>
          <Text style={styles.fileSize}>{formatFileSize(attachment.size)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.fileContainer}>
      <View style={styles.fileIconContainer}>
        <Ionicons name="document-outline" size={24} color="#007AFF" />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{attachment.name}</Text>
        <Text style={styles.fileSize}>{formatFileSize(attachment.size)}</Text>
      </View>
      <Ionicons name="download-outline" size={20} color="#666666" />
    </TouchableOpacity>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  imageInfo: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
}); 