import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Conversation, getConversations, deleteConversation } from '../utils/storage';
import { saveConversation } from '../utils/storage';

export default function ConversationsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const data = await getConversations();
    // Sort by most recent first
    data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setConversations(data);
  };

  const handleNewChat = () => {
    router.push({
        pathname: "/chat/[id]",
        params: { id: "new" }
    });
  };

const handleDeleteConversation = (id: string) => {
  // Validate the id parameter
  if (!id) {
    console.error('Invalid conversation ID provided to handleDeleteConversation');
    return;
  }

  Alert.alert(
    'Delete Conversation',
    'Are you sure you want to delete this conversation?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Show loading indicator (if you have one)
            // setIsLoading(true);
            
            console.log(`Attempting to delete conversation with ID: ${id}`);
            await deleteConversation(id);
            console.log('Conversation deleted successfully');
            
            // Reload the conversation list
            await loadConversations();
            
            // Optional: Show success toast or notification
            // Toast.show('Conversation deleted successfully');
          } catch (error) {
            // Handle any errors
            console.error('Error deleting conversation:', error);
            
            // Optional: Show error notification to user
            Alert.alert(
              'Error',
              'Failed to delete the conversation. Please try again.'
            );
          } finally {
            // Hide loading indicator (if you have one)
            // setIsLoading(false);
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

const renderItem = ({ item }: { item: Conversation }) => (
  <TouchableOpacity 
    style={styles.conversationItem}
    onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}
    activeOpacity={0.8}
  >
    <View style={styles.conversationContent}>
      <Text style={styles.conversationTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.conversationPreview} numberOfLines={1}>
        {item.messages[item.messages.length - 1]?.content || ''}
      </Text>
      <Text style={styles.conversationDate}>
        {formatDate(item.updatedAt)}
      </Text>
    </View>
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={(e) => {
        e.stopPropagation(); // 👈 This prevents the parent onPress
        handleDeleteConversation(item.id);
      }}
    >
      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
    </TouchableOpacity>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Conversations</Text>
      </View>
      
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Start a new chat to begin</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
      
      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.newChatButtonText}>New Chat</Text>
      </TouchableOpacity>
    </View>
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
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  newChatButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  newChatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});