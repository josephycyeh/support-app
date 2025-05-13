import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';

const screenWidth = Dimensions.get('window').width;

export const ProgressChart = () => {
  // Mock data for XP growth over time
  // In a real app, this would come from actual user data
  const data = [
    { day: 'Mon', xp: 25 },
    { day: 'Tue', xp: 40 },
    { day: 'Wed', xp: 30 },
    { day: 'Thu', xp: 70 },
    { day: 'Fri', xp: 55 },
    { day: 'Sat', xp: 65 },
    { day: 'Sun', xp: 85 },
  ];
  
  // Find max value for scaling
  const maxXP = Math.max(...data.map(item => item.xp));
  
  // Calculate chart dimensions
  const chartWidth = screenWidth - 80; // Accounting for padding
  const chartHeight = 150;
  const barWidth = chartWidth / data.length - 10;
  
  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <View style={styles.chartMetric}>
          <TrendingUp size={16} color={colors.primary} />
          <Text style={styles.chartMetricText}>+370 XP this week</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>100</Text>
          <Text style={styles.axisLabel}>75</Text>
          <Text style={styles.axisLabel}>50</Text>
          <Text style={styles.axisLabel}>25</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>
        
        {/* Chart area */}
        <View style={styles.chart}>
          {/* Horizontal grid lines */}
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: chartHeight * 0.25 }]} />
          <View style={[styles.gridLine, { top: chartHeight * 0.5 }]} />
          <View style={[styles.gridLine, { top: chartHeight * 0.75 }]} />
          <View style={[styles.gridLine, { top: chartHeight }]} />
          
          {/* Data bars */}
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const barHeight = (item.xp / 100) * chartHeight;
              
              return (
                <View key={index} style={styles.barColumn}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: item.xp > 50 ? colors.primary : 'rgba(126, 174, 217, 0.5)',
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  chartMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 174, 217, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  chartMetricText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
  },
  yAxisLabels: {
    width: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  chart: {
    flex: 1,
    height: 150,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
});