import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking, Share as ShareAPI } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MessageSquare, Shield, FileText, Trash2, ChevronRight, Mail, Share, Lightbulb, Clock, Crown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Superwall from 'expo-superwall/compat';
import { usePostHog } from 'posthog-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useChatStore } from '@/store/chatStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useMoodStore } from '@/store/moodStore';
import { useJournalStore } from '@/store/journalStore';
import { useActivityStore } from '@/store/activityStore';
import { useChecklistStore } from '@/store/checklistStore';
import { useMotivationStore } from '@/store/motivationStore';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';

export default function SettingsScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { clearHistory } = useChatStore();
  const { clearAll: clearSobriety } = useSobrietyStore();
  const { clearAll: clearReasons } = useReasonsStore();
  const { clearAll: clearMood } = useMoodStore();
  const { clearAll: clearJournal } = useJournalStore();
  const { clearAll: clearActivity } = useActivityStore();
  const { clearAll: clearChecklist } = useChecklistStore();
  const { clearAll: clearMotivation } = useMotivationStore();
  const { resetConfiguration: resetMoney } = useMoneySavedStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<'unknown' | 'active' | 'inactive'>('unknown');

  // Check subscription status
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      try {
        // Listen to subscription status changes
        const subscription = Superwall.shared.subscriptionStatusEmitter.addListener('change', (status) => {
          if (status.status === 'ACTIVE') {
            setSubscriptionStatus('active');
          } else if (status.status === 'INACTIVE') {
            setSubscriptionStatus('inactive');
          } else {
            setSubscriptionStatus('unknown');
          }
        });

        // Get initial subscription status
        Superwall.shared.getSubscriptionStatus().then((status) => {
          if (status.status === 'ACTIVE') {
            setSubscriptionStatus('active');
          } else if (status.status === 'INACTIVE') {
            setSubscriptionStatus('inactive');
          } else {
            setSubscriptionStatus('unknown');
          }
        }).catch(() => {
          setSubscriptionStatus('inactive'); // Default to inactive if unable to get status
        });

        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus('inactive'); // Default to inactive on error
      }
    };

    checkSubscriptionStatus();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleShareApp = async () => {
    try {
      await ShareAPI.share({
        message: 'I found this amazing app called Sobi that\'s been helping me on my recovery journey. It has an AI companion, mood tracking, journaling, and so much more. It might help you too! 💙',
        url: 'https://apps.apple.com/us/app/sobi-quit-tracker-recovery/id6745745695', // Replace with actual app store URL when available
        title: 'Sobi - Your Recovery Companion',
      });

      // Track the app share event
      posthog.capture('app_shared', {
        share_method: 'native_share'
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };


  const handleCheckInTimes = () => {
    router.push('/check-in-settings' as any);
  };

  const handleUpgradePress = () => {
    // Navigate to promo code screen
    router.push('/promo-code' as any);
  };
  
  const handleClearChatHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to delete all your conversations with Sobi? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear History", 
          onPress: () => clearHistory(),
          style: "destructive"
        }
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This will erase all your data including your sobriety progress, reasons, and chat history. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete Account", 
          onPress: async () => {
            try {
              // Clear all Zustand stores first (in-memory data)
              clearSobriety();
              clearReasons();
              clearMood();
              clearJournal();
              clearActivity();
              clearChecklist();
              clearMotivation();
              clearHistory();
              resetMoney();
              
              // Clear all AsyncStorage data (persisted data)
              await AsyncStorage.clear();
              
              // Navigate to root index which will redirect to onboarding
              // Using dismissAll to clear the entire navigation stack
              router.dismissAll();
              router.replace('/onboarding');
            } catch (error) {
              console.error('Error clearing storage:', error);
              Alert.alert('Error', 'Failed to delete account data. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Settings",
          headerShown: false,
        }} 
      />
      
      <Header title="Settings" onBack={handleBackPress} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Upgrade to Pro Section - Only show if user is not subscribed */}
        {subscriptionStatus === 'inactive' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upgrade</Text>
            <View style={styles.settingsGroup}>
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={handleUpgradePress}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIconContainer, styles.premiumIconContainer]}>
                    <Crown size={20} color={colors.primary} />
                  </View>
                  <View style={styles.upgradeTextContainer}>
                    <Text style={styles.settingsItemText}>Upgrade to Pro</Text>
                    <Text style={styles.upgradeSubtext}>Unlock premium features</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={handleCheckInTimes}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Check-in Times</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

         {/* Account Management Section */}
         <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={handleClearChatHistory}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <MessageSquare size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Clear Chat History</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            
            <View style={styles.settingsItemSeparator} />
            
            <TouchableOpacity 
              style={[styles.settingsItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <Trash2 size={20} color={colors.danger} />
                </View>
                <Text style={[styles.settingsItemText, styles.dangerText]}>Delete Account</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={handleShareApp}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <Share size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Share Sobi</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            
            <View style={styles.settingsItemSeparator} />
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => Linking.openURL('mailto:josephyeh.dev@gmail.com?subject=Feature Request')}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <Lightbulb size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Feature Request</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            
            <View style={styles.settingsItemSeparator} />
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => Linking.openURL('mailto:josephyeh.dev@gmail.com?subject=Sobi App Support')}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <Mail size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Contact Us</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Privacy</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => Linking.openURL('https://www.trysobi.com/privacy-policy')}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Privacy Policy</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
            
            <View style={styles.settingsItemSeparator} />
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => Linking.openURL('https://www.trysobi.com/terms-of-service')}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <FileText size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Terms of Service</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
        
       
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.cardBackground,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 152, 194, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  settingsItemSeparator: {
    height: 0.5,
    backgroundColor: colors.border,
    marginLeft: 68, // Align with text after icon
  },
  dangerItem: {
    // No special styling needed for container
  },
  dangerText: {
    color: colors.danger,
  },
  premiumIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)', // Gold background for premium
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
}); 