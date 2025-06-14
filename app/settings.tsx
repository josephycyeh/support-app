import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MessageSquare, Shield, FileText, Trash2, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useChatStore } from '@/store/chatStore';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';

export default function SettingsScreen() {
  const router = useRouter();
  const { clearHistory } = useChatStore();

  const handleBackPress = () => {
    router.back();
  };
  
  const handleClearChatHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to delete all your conversations with Sushi? This action cannot be undone.",
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
              // Clear all AsyncStorage data
              await AsyncStorage.clear();
              // Navigate back to onboarding
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
        {/* Legal & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Privacy</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => Linking.openURL('https://v0-sobi-landing-page.vercel.app/privacy-policy')}
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
              onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                  <FileText size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingsItemText}>Terms of Use</Text>
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
}); 