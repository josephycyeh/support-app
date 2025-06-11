import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, RefreshCw } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { TIME_CONSTANTS } from '@/utils/dateUtils';
import { MOTIVATION_PACKS } from '@/store/motivationStore';
import * as Haptics from 'expo-haptics';

export const DailyQuote = () => {
  const router = useRouter();

  // Get a consistent "daily" quote based on the current date
  const dailyQuote = useMemo(() => {
    // Get all quotes from all packs
    const allQuotes = MOTIVATION_PACKS.flatMap(pack => pack.quotes);
    
    // Use today's date as seed for consistent daily quote
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
    const quoteIndex = dayOfYear % allQuotes.length;
    
    return allQuotes[quoteIndex];
  }, []);

  const handlePress = () => {
    router.push('/motivation');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!dailyQuote) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.titleContainer}>
        <Sparkles size={20} color={colors.primary} />
        <Text style={styles.title}>Daily Motivation</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.quoteContainer}>
          <Text style={styles.openQuote}>"</Text>
          <Text style={styles.quoteText}>{dailyQuote.text}</Text>
          <Text style={styles.closeQuote}>"</Text>
        </View>
        <Text style={styles.tapHint}>tap for more quotes</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  content: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    position: 'relative',
  },
  quoteContainer: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    borderRadius: 16,
    marginVertical: 8,
  },
  openQuote: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '200',
    position: 'absolute',
    top: -8,
    left: 8,
    opacity: 0.6,
  },
  quoteText: {
    ...typography.quote,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  closeQuote: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '200',
    position: 'absolute',
    bottom: -8,
    right: 8,
    opacity: 0.6,
  },
  quoteIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  tapHint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 12,
    color: colors.primary,
    fontStyle: 'italic',
  },
}); 