import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: any;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  subtitle,
  children,
  style
}) => {
  return (
    <View style={[styles.stepContainer, style]}>
      <Text style={styles.onboardingTitle}>{title}</Text>
      {subtitle && (
        <Text style={styles.onboardingSubtitle}>{subtitle}</Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    gap: 30,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
}); 