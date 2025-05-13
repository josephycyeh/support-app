import { Platform, Animated, Easing } from 'react-native';

// Helper function to create safe animations that work on both web and native
export const createSafeAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number,
  easing = Easing.inOut(Easing.ease)
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: Platform.OS !== 'web',
  });
};

// Helper to create a loop animation
export const createLoopAnimation = (
  animatedValue: Animated.Value,
  config: {
    fromValue: number;
    toValue: number;
    duration: number;
    easing?: (value: number) => number;
  }
) => {
  const { fromValue, toValue, duration, easing = Easing.inOut(Easing.quad) } = config;
  
  return Animated.loop(
    Animated.sequence([
      createSafeAnimation(animatedValue, toValue, duration, easing),
      createSafeAnimation(animatedValue, fromValue, duration, easing)
    ])
  );
};

// Helper to create a pulse animation
export const createPulseAnimation = (
  animatedValue: Animated.Value,
  config: {
    minValue?: number;
    maxValue?: number;
    duration?: number;
  } = {}
) => {
  const { minValue = 1, maxValue = 1.1, duration = 1000 } = config;
  
  return createLoopAnimation(animatedValue, {
    fromValue: minValue,
    toValue: maxValue,
    duration,
  });
};

// Helper to create a fade-in animation
export const createFadeInAnimation = (
  animatedValue: Animated.Value,
  duration: number = 800
) => {
  return createSafeAnimation(animatedValue, 1, duration);
};

// Helper to create a staggered animation for lists
export const createStaggeredAnimation = (
  items: any[],
  createAnimatedValue: () => Animated.Value,
  animationCreator: (value: Animated.Value, index: number) => Animated.CompositeAnimation,
  staggerDelay: number = 100
) => {
  return items.map((_, index) => {
    const animValue = createAnimatedValue();
    const animation = animationCreator(animValue, index);
    
    // Start the animation with a delay based on index
    setTimeout(() => {
      animation.start();
    }, index * staggerDelay);
    
    return animValue;
  });
};