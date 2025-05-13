import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';

interface HeatmapCalendarProps {
  startDate: string;
}

export const HeatmapCalendar = ({ startDate }: HeatmapCalendarProps) => {
  // Get current date and month info
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate days since sobriety start
  const sobrietyStart = new Date(startDate);
  const daysSinceSobrietyStart = Math.floor((today.getTime() - sobrietyStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate calendar data
  const calendarData = generateCalendarData(currentYear, currentMonth, daysSinceSobrietyStart);
  
  // Get month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{monthName} {currentYear}</Text>
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
              />
            ))}
          </View>
        ))}
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Activity Level:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(126, 174, 217, 0.2)' }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(126, 174, 217, 0.5)' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(126, 174, 217, 0.8)' }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Perfect</Text>
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
}

const CalendarDay = ({ day, intensity, isToday, isEmpty }: CalendarDayProps) => {
  // Skip rendering for empty days
  if (isEmpty) {
    return <View style={styles.emptyDay} />;
  }
  
  // Calculate background color based on intensity
  let backgroundColor = 'transparent';
  if (intensity > 0) {
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

// Helper function to generate calendar data
const generateCalendarData = (year: number, month: number, daysSinceSobrietyStart: number) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  // Generate mock activity data - in a real app, this would come from actual user data
  const activityData: { [key: number]: number } = {};
  
  // Fill in activity data for days since sobriety start
  for (let i = 0; i <= daysSinceSobrietyStart; i++) {
    const day = new Date();
    day.setDate(today.getDate() - i);
    
    if (day.getMonth() === month && day.getFullYear() === year) {
      // Generate random activity level, with more recent days having higher probability of high activity
      const recencyFactor = 1 - (i / (daysSinceSobrietyStart + 1));
      const randomFactor = Math.random() * 0.5;
      activityData[day.getDate()] = Math.min(recencyFactor + randomFactor, 1);
    }
  }
  
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
        weekDays.push({ day: null, intensity: 0, isToday: false, isEmpty: true });
      } else {
        const isToday = dayCounter === today.getDate() && 
                        month === today.getMonth() && 
                        year === today.getFullYear();
        
        weekDays.push({
          day: dayCounter,
          intensity: activityData[dayCounter] || 0,
          isToday,
          isEmpty: false
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
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
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