import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, style }: CardProps) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
});