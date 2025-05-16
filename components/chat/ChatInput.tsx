import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Send } from 'lucide-react-native';
import colors from '@/constants/colors';

interface ChatInputProps {
  value: string;
  onChange: (e: any) => void;
  onSubmit: (e: any) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ value, onChange, onSubmit, isLoading }: ChatInputProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 90}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message Sushi..."
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={(text) => 
            onChange({
              target: { value: text },
              nativeEvent: { text }
            })
          }
          multiline
          maxLength={1000}
          autoFocus={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!value.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={onSubmit}
          disabled={!value.trim() || isLoading}
        >
          <Send size={20} color={!value.trim() || isLoading ? colors.textMuted : '#FFF'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', 
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 45,
    backgroundColor: colors.cardBackground,
    color: colors.text,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
}); 