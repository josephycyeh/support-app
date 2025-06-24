import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message Sobi..."
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
          textAlignVertical="top"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 44,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    backgroundColor: colors.cardBackground,
    color: colors.text,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
}); 