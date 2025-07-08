import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import Superwall from 'expo-superwall/compat';

export default function PromoCodeScreen() {
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Set the promo code as a Superwall user attribute
      if (promoCode.trim()) {
        await Superwall.shared.setUserAttributes({
          referral_code: promoCode.trim().toUpperCase()
        });
      }

      // Determine which placement to use
      const placement = promoCode.trim() ? 'referral' : 'upgrade_to_pro';
      
      // Register and launch Superwall paywall
      Superwall.shared.register({
        placement: placement,
        feature: () => {
          // This runs when user has access (after successful payment)
          Alert.alert(
            "Welcome to Pro!",
            "Thank you for upgrading! You now have access to all premium features.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      });
    } catch (error) {
      console.error('Error setting user attributes:', error);
      Alert.alert(
        "Error",
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Promo Code",
          headerShown: false,
        }} 
      />
      
      <Header title="Promo Code" onBack={handleBackPress} />
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Enter a promo code if you have one, or continue to upgrade
        </Text>

        <TextInput
          style={styles.input}
          value={promoCode}
          onChangeText={setPromoCode}
          placeholder="Enter promo code (optional)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={20}
        />

        <Button
          onPress={handleContinue}
          style={styles.continueButton}
        >
          {isLoading ? 'Processing...' : 'Continue to Upgrade'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: 32,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  continueButton: {
    // No additional styles needed, Button component handles it
  },
}); 