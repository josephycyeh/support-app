import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import * as Haptics from 'expo-haptics';

export const SOSButton = () => {
  const router = useRouter();

  const handleCrisisSupportPress = () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    router.push('/sos');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        activeOpacity={0.8}
        onPress={handleCrisisSupportPress}
      >
        <Heart size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>HELP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    right: 28,
    zIndex: 100,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
});