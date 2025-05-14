import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { Card } from '@/components/ui/Card';
import { createFadeInAnimation, createSafeAnimation } from '@/utils/animations';

export const SobrietyTimer = () => {
  const { startDate } = useSobrietyStore();
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  // Animation for the timer values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    // Animate the timer in on mount
    Animated.parallel([
      createFadeInAnimation(fadeAnim),
      createSafeAnimation(scaleAnim, 1, 800)
    ]).start();
  }, []);

  useEffect(() => {
    const calculateTimeElapsed = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const difference = now - start;
      
      // Convert to days, hours, minutes, seconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeElapsed({ days, hours, minutes, seconds });
    };

    // Calculate immediately and then every second
    calculateTimeElapsed();
    const interval = setInterval(calculateTimeElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [startDate]);

  const animationStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }]
  };

  return (
    <Animated.View style={[animationStyle, styles.container]}>
      <Card>
        <Text style={styles.title}>You've been sober for</Text>
        <View style={styles.timerContainer}>
          <TimeUnit value={timeElapsed.days} unit="days" />
          <TimeUnit value={timeElapsed.hours} unit="hours" />
          <TimeUnit value={timeElapsed.minutes} unit="min" />
          <TimeUnit value={timeElapsed.seconds} unit="sec" />
        </View>
      </Card>
    </Animated.View>
  );
};

const TimeUnit = ({ value, unit }: { value: number; unit: string }) => (
  <View style={styles.unitContainer}>
    <View style={styles.valueContainer}>
      <Text style={styles.unitValue}>{value}</Text>
    </View>
    <Text style={styles.unitLabel}>{unit}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  unitContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  valueContainer: {
    backgroundColor: colors.progressBackground,
    borderRadius: 16,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  unitValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  unitLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
});