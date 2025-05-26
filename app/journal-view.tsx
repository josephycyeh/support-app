import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Edit3 } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Header } from '@/components/ui/Header';
import { useJournalStore } from '@/store/journalStore';

export default function JournalViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { entries } = useJournalStore();
  
  const entryId = typeof params.id === 'string' ? params.id : '';
  
  // State to hold the current entry data
  const [currentEntry, setCurrentEntry] = useState(() => {
    // Initialize with params data as fallback
    return {
      id: entryId,
      title: typeof params.title === 'string' ? params.title : 'Untitled',
      content: typeof params.content === 'string' ? params.content : '',
      date: typeof params.date === 'string' ? params.date : '',
    };
  });
  
  // Update entry data when screen comes into focus or entries change
  useFocusEffect(
    React.useCallback(() => {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        setCurrentEntry(entry);
      }
    }, [entries, entryId])
  );
  
  const handleEdit = () => {
    router.push({
      pathname: '/journal-entry',
      params: {
        mode: 'edit',
        id: currentEntry.id,
        title: currentEntry.title,
        content: currentEntry.content,
        date: currentEntry.date,
      },
    });
  };
  
  const handleBack = () => {
    router.back();
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Journal Entry",
          headerShown: false,
        }} 
      />
      
      <Header 
        title="Journal Entry" 
        onBack={handleBack}
        rightComponent={
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Edit3 size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(currentEntry.date)}</Text>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{currentEntry.title}</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{currentEntry.content}</Text>
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateContainer: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  titleContainer: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  },
  contentContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
}); 