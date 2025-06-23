import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import { FlatList as RNFlatList } from 'react-native'; // Import FlatList with a different name to avoid conflict
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
}

const { width, height } = Dimensions.get('window');

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<RNFlatList<Message>>(null);

  const sendMessage = useCallback(async () => { // Make sendMessage async
    if (inputText.trim()) {
      setMessages((prevMessages: Message[]) => [
        ...prevMessages,
        { id: Date.now().toString(), text: inputText.trim(), sender: 'user' },
      ]);
      setInputText('');
      // Send message to backend
      try {
        const response = await fetch('http://localhost:8000/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputText.trim() }),
        });
        const data = await response.json();
        setMessages((prevMessages: Message[]) => [
          ...prevMessages,
          { id: (Date.now() + 1).toString(), text: data.message, sender: 'other' },
        ]);
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages((prevMessages: Message[]) => [
          ...prevMessages,
          { id: (Date.now() + 1).toString(), text: 'Error: Could not connect to server.', sender: 'other' },
        ]);
      } finally {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    }
  }, [inputText]);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessageContainer : styles.otherMessageContainer
    ]}>
      <BlurView intensity={50} tint="dark" style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
      </BlurView>
    </View>
  ), []);

  const router = useRouter();

  const goToUploadPage = useCallback(() => {
    router.push('/upload');
  }, [router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? Constants.statusBarHeight + 10 : 0}
    >
      {/* Background with a subtle gradient/color for depth */}
      <View style={styles.backgroundGradient} />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <BlurView intensity={70} tint="dark" style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#A9A9A9"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </BlurView>

      <TouchableOpacity style={styles.uploadButton} onPress={goToUploadPage}>
        <Text style={styles.uploadButtonText}>Go to Upload Page</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0FFE0', // Light green background
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // Example of a subtle radial gradient, adjust as needed
    // You might need a library like 'react-native-linear-gradient' for more complex gradients
    backgroundColor: 'radial-gradient(circle at top left, #C0FFC0, #E0FFE0)', // Lighter green gradient
    opacity: 0.8,
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Constants.statusBarHeight + 10, // Account for status bar
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    overflow: 'hidden', // Crucial for BlurView to respect borderRadius
    // Subtle border for definition
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageText: {
    color: '#FFFFFF', // White text for contrast
    fontSize: 16,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 25, // Rounded top corners
    borderTopRightRadius: 25,
    overflow: 'hidden', // Ensure blur respects border radius
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    marginTop: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Very subtle transparent background
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    color: '#E0E0E0',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: 'rgba(70, 130, 180, 0.7)', // SteelBlue with some transparency
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: 'rgba(100, 149, 237, 0.7)', // CornflowerBlue with some transparency
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
