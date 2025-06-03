import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useSobrietyStore } from '@/store/sobrietyStore';

export const XPProgressBar = () => {
  const { xp, xpToNextLevel, level } = useSobrietyStore();
  
  // Calculate progress percentage
  const progressPercentage = Math.min((xp / xpToNextLevel) * 100, 100);
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.xpLabel}>XP Progress</Text>
        <View style={styles.levelBadge}>
          <Star size={12} color="#FFFFFF" />
          <Text style={styles.levelText}>Lvl {level}</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>
      <View style={styles.xpTextContainer}>
        <Text style={styles.xpText}>{xp} / {xpToNextLevel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpLabel: {
    ...typography.h4,
    color: colors.text,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 14,
    backgroundColor: colors.progressBackground,
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 7,
  },
  xpTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  xpText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.text,
  },
});