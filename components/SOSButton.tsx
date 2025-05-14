import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export const SOSButton = () => {
  const router = useRouter();

  const handleSOSPress = () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    router.push('/sos');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        activeOpacity={0.8}
        onPress={handleSOSPress}
      >
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    zIndex: 100,
  },
  button: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    color: '#2D3142',
    fontSize: 18,
    fontWeight: '700',
  },
});