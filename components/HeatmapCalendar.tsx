import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSobrietyStore } from '@/store/sobrietyStore';

interface HeatmapCalendarProps {
  startDate: string;
}

export const HeatmapCalendar = ({ startDate }: HeatmapCalendarProps) => {
  // Initialize state for current view
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  
  // Get sobriety data from store
  const { dailyXP, sobrietyBreaks, firstAppUseDate } = useSobrietyStore();
  
  // Calculate days since sobriety start
  const today = new Date();
  const sobrietyStart = new Date(startDate);
  const firstAppUse = new Date(firstAppUseDate || startDate); // Fallback to startDate for existing users
  const daysSinceSobrietyStart = Math.floor((today.getTime() - sobrietyStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate calendar data
  const calendarData = generateCalendarData(viewYear, viewMonth, startDate, dailyXP, sobrietyBreaks);
  
  // Get month name
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };
  
  // Check if previous month navigation should be disabled
  const isPrevMonthDisabled = () => {
    const startMonth = firstAppUse.getMonth();
    const startYear = firstAppUse.getFullYear();
    
    return (viewYear < startYear) || (viewYear === startYear && viewMonth < startMonth);
  };
  
  // Check if next month navigation should be disabled
  const isNextMonthDisabled = () => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return (viewYear > currentYear) || (viewYear === currentYear && viewMonth > currentMonth);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              isPrevMonthDisabled() && styles.disabledButton
            ]} 
            onPress={goToPreviousMonth}
            disabled={isPrevMonthDisabled()}
          >
            <ChevronLeft size={20} color={isPrevMonthDisabled() ? colors.textMuted : colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>{monthName} {viewYear}</Text>
          
          <TouchableOpacity 
            style={[
              styles.navButton, 
              isNextMonthDisabled() && styles.disabledButton
            ]} 
            onPress={goToNextMonth}
            disabled={isNextMonthDisabled()}
          >
            <ChevronRight size={20} color={isNextMonthDisabled() ? colors.textMuted : colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekdaysRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.weekdayLabel}>{day}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.calendarGrid}>
        {calendarData.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => (
              <CalendarDay 
                key={dayIndex} 
                day={day.day} 
                intensity={day.intensity}
                isToday={day.isToday}
                isEmpty={day.isEmpty}
                isSobrietyBreak={day.isSobrietyBreak}
                xpEarned={day.xpEarned}
              />
            ))}
          </View>
        ))}
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Daily Engagement:</Text>
        <Text style={styles.legendSubtitle}>Sobriety + activities make days bluer</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(126, 174, 217, 0.2)' }]} />
            <Text style={styles.legendText}>Sober</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(126, 174, 217, 0.5)' }]} />
            <Text style={styles.legendText}>Active</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(126, 174, 217, 0.8)' }]} />
            <Text style={styles.legendText}>Engaged</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Thriving</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface CalendarDayProps {
  day: number | null;
  intensity: number;
  isToday: boolean;
  isEmpty: boolean;
  isSobrietyBreak: boolean;
  xpEarned: number;
}

const CalendarDay = ({ day, intensity, isToday, isEmpty, isSobrietyBreak, xpEarned }: CalendarDayProps) => {
  // Skip rendering for empty days
  if (isEmpty) {
    return <View style={styles.emptyDay} />;
  }
  
  // Calculate background color based on intensity
  let backgroundColor = 'transparent';
  let tooltipText = `${xpEarned} XP`;
  
  if (isSobrietyBreak) {
    backgroundColor = 'transparent'; // No color for sobriety breaks
    tooltipText = 'Sobriety break';
  } else if (intensity > 0) {
    if (intensity < 0.3) {
      backgroundColor = 'rgba(126, 174, 217, 0.2)';
    } else if (intensity < 0.6) {
      backgroundColor = 'rgba(126, 174, 217, 0.5)';
    } else if (intensity < 0.9) {
      backgroundColor = 'rgba(126, 174, 217, 0.8)';
    } else {
      backgroundColor = colors.primary;
    }
  }
  
  return (
    <TouchableOpacity 
      style={[
        styles.dayCell,
        { backgroundColor },
        isToday && styles.todayCell
      ]}
    >
      <Text style={[
        styles.dayText,
        isToday && styles.todayText,
        intensity > 0.5 && styles.highIntensityText
      ]}>
        {day}
      </Text>
    </TouchableOpacity>
  );
};

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to generate calendar data
const generateCalendarData = (
  year: number, 
  month: number, 
  startDate: string, 
  dailyXP: Record<string, number> = {}, 
  sobrietyBreaks: string[] = []
) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  // Create calendar grid
  const calendar = [];
  let dayCounter = 1;
  
  // Create weeks
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    
    // Create days in a week
    for (let day = 0; day < 7; day++) {
      if ((week === 0 && day < firstDayOfMonth) || dayCounter > daysInMonth) {
        // Empty cell
        weekDays.push({ 
          day: null, 
          intensity: 0, 
          isToday: false, 
          isEmpty: true, 
          isSobrietyBreak: false,
          xpEarned: 0
        });
      } else {
        // Create date at the beginning of the day (midnight) to avoid timezone issues
        const currentDate = new Date(Date.UTC(year, month, dayCounter, 0, 0, 0));
        const isToday = dayCounter === today.getDate() && 
                        month === today.getMonth() && 
                        year === today.getFullYear();
        
        // Check if date is before sobriety start
        const sobrietyStart = new Date(startDate);
        const isBeforeSobrietyStart = currentDate < sobrietyStart;
        
        // Format date as ISO string for lookup
        const dateStr = formatDateToYYYYMMDD(currentDate);
        
        // Check if this day had a sobriety break
        const isSobrietyBreak = sobrietyBreaks.includes(dateStr);
        
        // Get XP earned for this day
        const xpEarned = dailyXP[dateStr] || 0;
        
        // Calculate intensity based on XP
        let intensity = 0;
        if (!isBeforeSobrietyStart && !isSobrietyBreak) {
          if (xpEarned > 0 && xpEarned <= 20) {
            intensity = 0.2;
          } else if (xpEarned > 20 && xpEarned <= 50) {
            intensity = 0.5;
          } else if (xpEarned > 50 && xpEarned <= 100) {
            intensity = 0.8;
          } else if (xpEarned > 100) {
            intensity = 1.0;
          }
        }
        
        weekDays.push({
          day: dayCounter,
          intensity,
          isToday,
          isEmpty: false,
          isSobrietyBreak,
          xpEarned
        });
        
        dayCounter++;
      }
    }
    
    calendar.push(weekDays);
    
    // Break if we've filled all days
    if (dayCounter > daysInMonth && week >= 3) {
      break;
    }
  }
  
  return calendar;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(126, 174, 217, 0.1)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    fontSize: 12,
    color: colors.textLight,
    width: 30,
    textAlign: 'center',
  },
  calendarGrid: {
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayCell: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyDay: {
    width: 30,
    height: 30,
  },
  dayText: {
    fontSize: 12,
    color: colors.text,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todayText: {
    fontWeight: '700',
  },
  highIntensityText: {
    color: '#FFFFFF',
  },
  legend: {
    marginTop: 8,
  },
  legendTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  legendSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 16,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  legendText: {
    fontSize: 12,
    color: colors.textLight,
  },
});