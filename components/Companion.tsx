import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MessageSquare, Wind, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { usePostHog } from 'posthog-react-native';
import Superwall from 'expo-superwall/compat';

const animations = {
  petting: require('@/assets/images/getting petted_opt.json'),
  celebrating: require('@/assets/images/idle_celebration.json'),
  idleBlink: require('@/assets/images/idle_blink.json'),
};

interface CompanionProps {
  animationTrigger?: number;
  stopAnimations?: boolean;
}

export const Companion = ({ animationTrigger, stopAnimations }: CompanionProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSource, setAnimationSource] = useState(animations.idleBlink);
  const [loopAnimation, setLoopAnimation] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const lottieRef = useRef<LottieView>(null);
  const router = useRouter();
  const posthog = usePostHog();

  // Trigger petting animation when a task is completed
  useEffect(() => {
    if (animationTrigger && animationTrigger > 0) {
      if (isAnimating) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setAnimationSource(animations.petting);
      setLoopAnimation(false);
      setIsAnimating(true);
      setAnimationKey((prevKey) => prevKey + 1);
    }
  }, [animationTrigger]);

  // Stop animations when component should stop (e.g. screen loses focus)
  useEffect(() => {
    if (stopAnimations) {
      if (lottieRef.current) {
        lottieRef.current.reset();
      }
      setIsAnimating(false);
    }
  }, [stopAnimations]);

  const handleAnimationFinish = () => {
    setIsAnimating(false);
    setAnimationSource(animations.idleBlink);
    setLoopAnimation(true);
    setAnimationKey((prevKey) => prevKey + 1);
  };

  const handleChatPress = () => {
    // Track chat button click
    posthog.capture('chat_button_clicked', {
      source: 'companion_component',
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/chat');
    // Register paywall for chat feature
    // Superwall.shared.register({
    //   placement: 'chat',
    //   feature: () => {
    //     // This runs when user has access (premium user or after payment)
    //     router.push('/chat');
    //   }
    // });
  };

  const handleBreathingPress = () => {
    // Track breathing button click
    posthog.capture('breathing_button_clicked', {
      source: 'companion_component',
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Register paywall for breathing feature
    Superwall.shared.register({
      placement: 'breathing_exercises',
      feature: () => {
        // This runs when user has access (premium user or after payment)
        router.push('/breathing');
      }
    });
  };

  const handleCompanionPress = () => {
    if (isAnimating) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const randomAnimation = Math.random() < 0.5 ? animations.petting : animations.celebrating;
    setAnimationSource(randomAnimation);
    setLoopAnimation(false);
    setIsAnimating(true);
    setAnimationKey((prevKey) => prevKey + 1);
  };

  const handleJournalPress = () => {
    // Track journaling button click
    posthog.capture('journaling_button_clicked', {
      source: 'companion_component',
    });
    
    // Navigate to the main journal page to view all entries
    router.push('/journal');
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <View style={styles.companionContainer}>
        <View style={styles.companionRow}>
          {/* Breathing button positioned to the left of companion */}
          <View style={[styles.actionButtonContainer, styles.leftButtonContainer]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleBreathingPress}
            >
              <Wind size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.actionButtonLabel}>Breathing</Text>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleCompanionPress}
            style={styles.companionTouchable}
          >
            <View style={styles.companionImageContainer}>
              <View style={styles.lottieContainer}>
                <LottieView
                  key={animationKey}
                  ref={lottieRef}
                  source={animationSource}
                  style={styles.lottieAnimation}
                  loop={loopAnimation}
                  autoPlay={true}
                  resizeMode="cover"
                  onAnimationFinish={isAnimating ? handleAnimationFinish : undefined}
                />
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Journal button positioned to the right of companion */}
          <View style={[styles.actionButtonContainer, styles.rightButtonContainer]}>
          <TouchableOpacity 
              style={styles.actionButton}
            onPress={handleJournalPress}
          >
            <BookOpen size={28} color={colors.primary} />
          </TouchableOpacity>
            <Text style={styles.actionButtonLabel}>Journal</Text>
          </View>
        </View>
      </View>
      
      <Button 
        onPress={handleChatPress}
        variant="secondary"
        style={styles.talkButton}
        textStyle={styles.talkButtonText}
        icon={<MessageSquare size={18} color={colors.text} />}
      >
        Talk with Sobi
      </Button>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', 
    marginBottom: 8
  },
  companionContainer: {
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    paddingHorizontal: 40,
  },
  companionTouchable: {
    alignItems: 'center',
  },
  companionImageContainer: {
    borderRadius: 60,
    borderWidth: 0,
    width: 125,
    height: 125,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  companionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  lottieContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  talkButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8C088',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  talkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  actionButtonContainer: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 8,
  },
  leftButtonContainer: {
    position: 'absolute',
    left: 20,
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 20,
  },
  actionButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 28,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },

});