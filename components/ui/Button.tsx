import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import colors from '@/constants/colors';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ReactNode;
}

export const Button = ({ 
  onPress, 
  children, 
  variant = 'primary', 
  size = 'medium',
  style,
  textStyle,
  icon
}: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles[variant], 
        styles[size],
        style
      ]} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[
        styles.text, 
        styles[`${variant}Text`],
        textStyle
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: colors.text,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: colors.text,
  },
  iconContainer: {
    marginRight: 8,
  },
});