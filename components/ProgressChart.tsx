import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';

const screenWidth = Dimensions.get('window').width;

export const ProgressChart = () => {
  const { dailyXP } = useSobrietyStore();
  
  // Generate last 7 days of XP data
  const weekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];
    let totalWeekXP = 0;
    
    // Go back through the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Format to YYYY-MM-DD for lookup in dailyXP
      const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        .toISOString().split('T')[0];
      
      const dayOfWeek = days[date.getDay()];
      const xp = dailyXP[dateStr] || 0;
      totalWeekXP += xp;
      
      result.push({ 
        day: dayOfWeek, 
        xp,
        date: dateStr
      });
    }
    
    return { data: result, totalWeekXP };
  }, [dailyXP]);
  
  // Find max value for scaling
  const maxXP = Math.max(...weekData.data.map(item => item.xp), 10); // Min of 10 to prevent empty chart
  
  // Calculate chart dimensions
  const chartWidth = screenWidth - 80; // Accounting for padding
  const chartHeight = 150;
  const barWidth = chartWidth / weekData.data.length - 10;
  
  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <View style={styles.chartMetric}>
          <TrendingUp size={16} color={colors.primary} />
          <Text style={styles.chartMetricText}>+{weekData.totalWeekXP} XP this week</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{Math.ceil(maxXP)}</Text>
          <Text style={styles.axisLabel}>{Math.ceil(maxXP * 0.75)}</Text>
          <Text style={styles.axisLabel}>{Math.ceil(maxXP * 0.5)}</Text>
          <Text style={styles.axisLabel}>{Math.ceil(maxXP * 0.25)}</Text>
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
            {weekData.data.map((item, index) => {
              // Prevent division by zero and ensure the bar has at least a minimal height when xp > 0
              const barHeight = maxXP === 0 
                ? 0 
                : Math.max((item.xp / maxXP) * chartHeight, item.xp > 0 ? 5 : 0);
              
              return (
                <View key={index} style={styles.barColumn}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: item.xp > (maxXP * 0.5) ? colors.primary : 'rgba(126, 174, 217, 0.5)',
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