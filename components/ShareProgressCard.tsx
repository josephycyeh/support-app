import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Calendar, Star, TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import { calculateDaysSober } from '@/utils/dateUtils';
import { useSobrietyStore } from '@/store/sobrietyStore';

const screenWidth = Dimensions.get('window').width;

interface ShareProgressCardProps {
  // This component will be captured as an image
}

export const ShareProgressCard = React.forwardRef<View, ShareProgressCardProps>((props, ref) => {
  const { startDate, level, name } = useSobrietyStore();
  const daysSober = calculateDaysSober(startDate);
  
  // Calculate weeks, months, years for display
  const weeks = Math.floor(daysSober / 7);
  const months = Math.floor(daysSober / 30);
  const years = Math.floor(daysSober / 365);

  const getMainDisplay = () => {
    if (years >= 1) {
      return { value: years, unit: years === 1 ? 'Year' : 'Years', icon: <Trophy size={32} color="#FFD700" /> };
    } else if (months >= 1) {
      return { value: months, unit: months === 1 ? 'Month' : 'Months', icon: <Calendar size={32} color={colors.primary} /> };
    } else if (weeks >= 1) {
      return { value: weeks, unit: weeks === 1 ? 'Week' : 'Weeks', icon: <Star size={32} color={colors.accent} /> };
    } else {
      return { value: daysSober, unit: daysSober === 1 ? 'Day' : 'Days', icon: <TrendingUp size={32} color={colors.primary} /> };
    }
  };

  const mainDisplay = getMainDisplay();

  return (
    <View ref={ref} style={styles.cardContainer}>
      <LinearGradient
        colors={['#7EA5D9', '#6B98C2', '#5A8BB0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Translucent Inner Card */}
        <View style={styles.innerCard}>
          {/* Main Achievement */}
          <View style={styles.achievementSection}>
            <Text style={styles.mainNumber}>{mainDisplay.value}</Text>
            <Text style={styles.mainUnit}>{mainDisplay.unit}</Text>
            <Text style={styles.soberText}>Sober</Text>
          </View>
        </View>
        
        {/* Personal Info - Outside inner card */}
        <View style={styles.personalSection}>
          {name && <Text style={styles.userName}>{name}</Text>}
          <Text style={styles.daysText}>{daysSober} days strong</Text>
        </View>
        
        {/* Footer */}
        <Text style={styles.footerText}>Sobi</Text>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  card: {
    width: screenWidth - 80,
    height: screenWidth * 1.1,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  innerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  achievementSection: {
    alignItems: 'center',
  },
  mainNumber: {
    fontSize: 76,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 76,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mainUnit: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  soberText: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  personalSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    letterSpacing: 1,
  },
}); 