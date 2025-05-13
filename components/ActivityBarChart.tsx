import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import colors from '@/constants/colors';

export const ActivityBarChart = () => {
  // Mock data for activities completed
  // In a real app, this would come from actual user data
  const data = [
    { activity: 'Breathing', count: 8, color: '#7EAED9' },
    { activity: 'Journaling', count: 5, color: '#D4B8D9' },
    { activity: 'Meditation', count: 3, color: '#FFE0A3' },
    { activity: 'Exercise', count: 4, color: '#A8D8B9' },
  ];
  
  // Find max value for scaling
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.activityRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.activityLabel}>{item.activity}</Text>
          </View>
          
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: item.color,
                }
              ]} 
            />
            <Text style={styles.countLabel}>{item.count}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelContainer: {
    width: 80,
  },
  activityLabel: {
    fontSize: 13,
    color: colors.text,
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
  countLabel: {
    position: 'absolute',
    right: 12,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});