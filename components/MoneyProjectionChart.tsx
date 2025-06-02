import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import { BarChart } from 'react-native-gifted-charts';
import colors from '@/constants/colors';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { useSobrietyStore } from '@/store/sobrietyStore';

export const MoneyProjectionChart = () => {
  const { dailySpending, calculateTotalSaved, currency } = useMoneySavedStore();
  const { startDate } = useSobrietyStore();
  
  // Calculate data for chart (current + future projections only)
  const chartData = useMemo(() => {
    const now = new Date();
    const start = new Date(startDate);
    const daysSober = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    interface ChartDataPoint {
      value: number;
      label: string;
      frontColor: string;
      gradientColor: string;
      spacing: number;
      labelTextStyle: {
        fontSize: number;
        fontWeight: string;
        color: string;
      };
      borderWidth?: number;
      borderColor?: string;
    }
    
    const data: ChartDataPoint[] = [];
    const timeframes = [
      { label: 'Now', days: 0, isFuture: false },
      { label: '1 Week', days: 7, isFuture: true },
      { label: '1 Month', days: 30, isFuture: true },
      { label: '3 Months', days: 90, isFuture: true },
      { label: '6 Months', days: 180, isFuture: true },
    ];
    
    timeframes.forEach((timeframe, index) => {
      const totalDays = daysSober + timeframe.days;
      const amount = calculateTotalSaved(totalDays);
      
      const dataPoint: ChartDataPoint = {
        value: Math.max(1, amount),
        label: timeframe.label,
        frontColor: timeframe.isFuture ? 'rgba(76, 175, 80, 0.3)' : colors.success,
        gradientColor: timeframe.isFuture ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.8)',
        spacing: 12,
        labelTextStyle: {
          fontSize: 10,
          fontWeight: timeframe.label === 'Now' ? '700' : '600',
          color: timeframe.isFuture ? colors.textMuted : colors.textLight,
        },
      };
      
      if (timeframe.isFuture) {
        dataPoint.borderWidth = 1.5;
        dataPoint.borderColor = 'rgba(76, 175, 80, 0.4)';
      }
      
      data.push(dataPoint);
    });
    
    return data;
  }, [dailySpending, calculateTotalSaved, startDate, colors]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${currency}${(amount / 1000).toFixed(1)}k`;
    }
    return `${currency}${Math.round(amount)}`;
  };

  const maxValue = Math.max(...chartData.map(item => item.value), 100);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.chartHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <DollarSign size={20} color={colors.success} />
            </View>
            <Text style={styles.chartTitle}>Savings Projection</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={320}
            height={140}
            barWidth={45}
            spacing={12}
            initialSpacing={15}
            endSpacing={15}
            noOfSections={4}
            yAxisThickness={0}
            xAxisThickness={0}
            isAnimated
            animationDuration={800}
            frontColor={colors.success}
            backgroundColor="rgba(248, 250, 252, 0.5)"
            barBorderRadius={6}
            yAxisTextStyle={{
              fontSize: 11,
              fontWeight: '600',
              color: colors.textLight,
            }}
            yAxisLabelTexts={[
              '0',
              formatCurrency(maxValue * 0.25),
              formatCurrency(maxValue * 0.5),
              formatCurrency(maxValue * 0.75),
              formatCurrency(maxValue),
            ]}
            maxValue={maxValue * 1.1}
            rulesType="solid"
            rulesColor="rgba(0,0,0,0.04)"
            showReferenceLine1
            referenceLine1Config={{
              color: 'rgba(0,0,0,0.06)',
              dashWidth: 3,
              dashGap: 3,
            }}
            renderTooltip={(item: any, index: number) => {
              const dataPoint = chartData[index];
              return (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    {formatCurrency(dataPoint.value)}
                  </Text>
                </View>
              );
            }}
          />
        </View>
        
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Current savings</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'rgba(76, 175, 80, 0.4)' }]} />
            <Text style={styles.legendText}>Projected</Text>
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
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: 'rgba(76, 175, 80, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  tooltip: {
    backgroundColor: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    paddingTop: 16,
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  legendText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
}); 