import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { Card } from '@/components/ui/Card';
import { createFadeInAnimation, createSafeAnimation } from '@/utils/animations';

export const SobrietyTimer = () => {
  const { startDate } = useSobrietyStore();
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
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
      const start = new Date(startDate);
      const now = new Date();
      
      // Calculate years, months, and remaining days
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      
      // Adjust for negative months
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // Calculate days within the current month
      const startDay = start.getDate();
      const nowDay = now.getDate();
      let days = nowDay - startDay;
      
      // If current day is less than start day, subtract a month and add days from previous month
      if (days < 0) {
        months--;
        if (months < 0) {
          years--;
          months += 12;
        }
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      
      // Calculate remaining time within the current day
      let hours = now.getHours() - start.getHours();
      let minutes = now.getMinutes() - start.getMinutes();
      let seconds = now.getSeconds() - start.getSeconds();
      
      // Adjust for negative seconds
      if (seconds < 0) {
        minutes--;
        seconds += 60;
      }
      
      // Adjust for negative minutes
      if (minutes < 0) {
        hours--;
        minutes += 60;
      }
      
      // Adjust for negative hours
      if (hours < 0) {
        days--;
        hours += 24;
        
        // If days becomes negative, adjust months and years
        if (days < 0) {
          months--;
          if (months < 0) {
            years--;
            months += 12;
          }
          const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          days += prevMonth.getDate();
        }
      }
      
      setTimeElapsed({ years, months, days, hours, minutes, seconds });
    };

    // Calculate immediately and then every second
    calculateTimeElapsed();
    const interval = setInterval(calculateTimeElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [startDate]);

  // Determine which time units to display based on duration
  const getDisplayUnits = () => {
    const { years, months, days, hours, minutes, seconds } = timeElapsed;
    
    if (years > 0) {
      // Show years, months, days, hours for long-term sobriety
      return [
        { value: years, unit: years === 1 ? 'year' : 'years' },
        { value: months, unit: months === 1 ? 'month' : 'months' },
        { value: days, unit: 'days' },
        { value: hours, unit: 'hours' }
      ];
    } else if (months > 0) {
      // Show months, days, hours, minutes for medium-term sobriety
      return [
        { value: months, unit: months === 1 ? 'month' : 'months' },
        { value: days, unit: 'days' },
        { value: hours, unit: 'hours' },
        { value: minutes, unit: 'min' }
      ];
    } else {
      // Show days, hours, minutes, seconds for early sobriety
      return [
        { value: days, unit: 'days' },
        { value: hours, unit: 'hours' },
        { value: minutes, unit: 'min' },
        { value: seconds, unit: 'sec' }
      ];
    }
  };

  const animationStyle = {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      };

  const displayUnits = getDisplayUnits();

  return (
    <Animated.View style={[animationStyle, styles.container]}>
      <Card style={styles.cardContainer}>
        <Text style={styles.title}>You've been sober for</Text>
        <View style={styles.timerContainer}>
          {displayUnits.map((unit, index) => (
            <TimeUnit key={index} value={unit.value} unit={unit.unit} />
          ))}
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

  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    ...typography.h2,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '700',
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
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
});