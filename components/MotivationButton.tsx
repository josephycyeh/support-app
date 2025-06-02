import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export const MotivationButton = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/motivation');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Sparkles size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Daily Motivation</Text>
        <Text style={styles.subtitle}>Inspiring quotes for your journey</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.progressBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
}); 