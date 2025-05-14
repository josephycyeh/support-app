import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useJournalStore, JournalEntry } from '@/store/journalStore';
import { Button } from '@/components/ui/Button';
import { createSafeAnimation } from '@/utils/animations';

export default function JournalScreen() {
  const router = useRouter();
  const { entries, deleteEntry } = useJournalStore();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show "Today"
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Group entries by date
  const groupedEntries = React.useMemo(() => {
    const groups: { [key: string]: JournalEntry[] } = {};
    
    entries.forEach(entry => {
      const dateKey = formatDate(entry.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });
    
    return groups;
  }, [entries]);

  const handleBackPress = () => {
    router.back();
  };
  
  const handleNewEntry = () => {
    router.push('/journal-entry');
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Journal",
          headerShown: false,
        }} 
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Journal</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerSubtitle}>Record your thoughts and reflections</Text>
        
        {Object.keys(groupedEntries).length > 0 ? (
          Object.entries(groupedEntries).map(([date, dateEntries], groupIndex) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              
              {dateEntries.map((entry, entryIndex) => (
                <JournalEntryCard 
                  key={entry.id} 
                  entry={entry}
                  onDelete={() => deleteEntry(entry.id)}
                  index={groupIndex * 10 + entryIndex}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No journal entries yet</Text>
            <Text style={styles.emptyStateText}>
              Start recording your thoughts and reflections to track your journey.
            </Text>
            <Button
              onPress={handleNewEntry}
              variant="primary"
              style={styles.emptyStateButton}
            >
              Write First Entry
            </Button>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleNewEntry}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  onDelete: () => void;
  index: number;
}

const JournalEntryCard = ({ entry, onDelete, index }: JournalEntryCardProps) => {
  const [animation] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    // Staggered animation based on index
    const delay = index * 50;
    setTimeout(() => {
      createSafeAnimation(animation, 1, 400).start();
    }, delay);
  }, []);
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Truncate content for preview
  const truncateContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
  
  const animationStyle = {
    opacity: animation,
    transform: [
      { 
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      }
    ]
  };
  
  return (
    <AnimatedTouchable 
      style={[styles.entryCard, animationStyle]}
      activeOpacity={0.7}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{entry.title}</Text>
        <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
      </View>
      
      <Text style={styles.entryContent} numberOfLines={4}>
        {truncateContent(entry.content)}
      </Text>
      
      <View style={styles.entryActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Edit size={18} color={colors.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Trash2 size={18} color={colors.danger} />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  entryTime: {
    fontSize: 14,
    color: colors.textLight,
  },
  entryContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  entryActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  deleteText: {
    color: colors.danger,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
});