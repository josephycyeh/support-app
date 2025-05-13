import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform, ViewStyle } from 'react-native';
import { createSafeAnimation } from '@/utils/animations';

interface AnimatedCircleProps {
  size: number;
  targetSize: number;
  duration: number;
  color: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AnimatedCircle = ({ 
  size, 
  targetSize, 
  duration, 
  color, 
  style, 
  children 
}: AnimatedCircleProps) => {
  const circleSize = useRef(new Animated.Value(size)).current;
  const circleOpacity = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    // Animate to the target size whenever it changes
    Animated.parallel([
      createSafeAnimation(circleSize, targetSize, duration),
      createSafeAnimation(circleOpacity, targetSize > size ? 0.7 : 0.3, duration)
    ]).start();
  }, [targetSize, duration]);
  
  // Use regular View for web to avoid animation issues
  const AnimatedView = Platform.OS === 'web' ? View : Animated.View;
  const animationStyle = Platform.OS === 'web' 
    ? { width: targetSize, height: targetSize, opacity: targetSize > size ? 0.7 : 0.3 } 
    : {
        width: circleSize,
        height: circleSize,
        opacity: circleOpacity
      };
  
  return (
    <AnimatedView 
      style={[
        styles.circle,
        { backgroundColor: color },
        animationStyle,
        style
      ]}
    >
      {children}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  circle: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
});