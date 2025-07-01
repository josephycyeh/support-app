import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Share as ShareIcon, Download } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { usePostHog } from 'posthog-react-native';
import colors from '@/constants/colors';
import { ShareProgressCard } from '@/components/ShareProgressCard';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { calculateDaysSober } from '@/utils/dateUtils';

export default function ShareProgressScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<View>(null);
  const { startDate, name } = useSobrietyStore();
  const daysSober = calculateDaysSober(startDate);

  const handleBack = () => {
    router.back();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const captureAndShare = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Capture the card as an image
      const uri = await captureRef(cardRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Share just the image
      await Share.share({
        url: uri,
        title: 'My Sobriety Progress',
      });

      // Track the share event
      posthog.capture('progress_shared', {
        days_sober: daysSober,
        share_method: 'native_share'
      });

    } catch (error) {
      console.error('Error sharing progress:', error);
      Alert.alert('Error', 'Failed to share your progress. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const downloadToGallery = async () => {
    if (!cardRef.current) return;

    try {
      // Request permission to access media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your gallery.');
        return;
      }

      setIsSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Capture the card as an image
      const uri = await captureRef(cardRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(uri);
      
      // Track the download event
      posthog.capture('progress_downloaded', {
        days_sober: daysSober,
        save_method: 'media_library'
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your progress card has been saved to your gallery!');

    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'Failed to save image to gallery. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Content */}
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.subtitle}>Share your achievement with others</Text>
        
        {/* Progress Card */}
        <View style={styles.cardContainer}>
          <ShareProgressCard ref={cardRef} />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
          onPress={captureAndShare}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          <ShareIcon size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>
            {isSharing ? 'Sharing...' : 'Share My Progress'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.downloadButton, isSharing && styles.downloadButtonDisabled]}
          onPress={downloadToGallery}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          <Download size={20} color={colors.primary} />
          <Text style={styles.downloadButtonText}>
            {isSharing ? 'Saving...' : 'Save To Gallery'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 20,
    gap: 12,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 