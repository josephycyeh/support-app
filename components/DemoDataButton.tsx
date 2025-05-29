import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { populateDemoData } from '@/scripts/populateDemoData';
import colors from '@/constants/colors';

export const DemoDataButton = () => {
  const handlePress = () => {
    Alert.alert(
      'Populate Demo Data',
      'This will add demo data for sobriety tracking, mood logs, journal entries, and chat messages. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Populate',
          style: 'default',
          onPress: () => {
            populateDemoData();
            Alert.alert('Success!', 'Demo data has been populated. Restart the app to see all changes.');
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.buttonText}>Populate Demo Data</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 