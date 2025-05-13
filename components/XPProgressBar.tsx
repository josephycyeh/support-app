import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';

export const XPProgressBar = () => {
  const { xp, xpToNextLevel, level } = useSobrietyStore();
  
  // Calculate progress percentage
  const progressPercentage = Math.min((xp / xpToNextLevel) * 100, 100);
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.xpLabel}>XP</Text>
        <Text style={styles.levelText}>Lvl {level}</Text>
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
    marginBottom: 14,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  levelText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.progressBackground,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.progressFill,
    borderRadius: 6,
  },
  xpTextContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  xpText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  }
});