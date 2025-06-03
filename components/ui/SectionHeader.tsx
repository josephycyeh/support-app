import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const SectionHeader = ({ title, subtitle, style }: SectionHeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
  },
});