import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Edit, Trash2, AlertTriangle, BookOpen } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useJournalStore, JournalEntry } from '@/store/journalStore';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { JournalModeModal } from '@/components/JournalModeModal';
import { createSafeAnimation } from '@/utils/animations';

export default function JournalScreen() {
  const router = useRouter();
  const { entries, deleteEntry } = useJournalStore();
  const [showModeModal, setShowModeModal] = React.useState(false);
  
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
    setShowModeModal(true);
  };
  
  const handleSelectJournal = () => {
    setShowModeModal(false);
    router.push('/journal-entry');
  };
  
  const handleSelectTrigger = () => {
    setShowModeModal(false);
    router.push('/trigger-entry');
  };
  
  const handleEditEntry = (entry: JournalEntry) => {
    if (entry.type === 'trigger') {
      // Parse the trigger content to extract fields
      const lines = entry.content.split('\n\n');
      const triggerMatch = lines[0]?.match(/Trigger: (.+)/);
      const intensityMatch = lines[1]?.match(/Intensity: (\d+)\/10/);
      const copingMatch = lines[2]?.match(/Coping Strategy: (.+)/);
      const outcomeMatch = lines[3]?.match(/Outcome: (.+)/);
      
      // Convert outcome text back to the button value
      const outcomeText = outcomeMatch?.[1] || 'Stayed Strong';
      const outcomeValue = outcomeText === 'Stayed Strong' ? 'stayed-strong' : 'relapsed';
      
      router.push({
        pathname: '/trigger-entry',
        params: {
          mode: 'edit',
          id: entry.id,
          title: entry.title,
          trigger: triggerMatch?.[1] || '',
          intensity: intensityMatch?.[1] || '5',
          copingStrategy: copingMatch?.[1] || '',
          outcome: outcomeValue,
          date: entry.date,
        },
      });
    } else {
      router.push({
        pathname: '/journal-entry',
        params: { 
          mode: 'edit', 
          id: entry.id,
          title: entry.title,
          content: entry.content,
          date: entry.date
        }
      });
    }
  };
  
  const handleViewEntry = (entry: JournalEntry) => {
    if (entry.type === 'trigger') {
      router.push({
        pathname: '/trigger-view',
        params: { 
          id: entry.id,
        }
      });
    } else {
      router.push({
        pathname: '/journal-view',
        params: { 
          id: entry.id,
          title: entry.title,
          content: entry.content,
          date: entry.date
        }
      });
    }
  };
  
  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteEntry(entryId),
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Journal",
          headerShown: false,
        }} 
      />
      
      <Header title="Your Journal" onBack={handleBackPress} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerSubtitle}>Record your thoughts and track triggers</Text>
        
        {Object.keys(groupedEntries).length > 0 ? (
          Object.entries(groupedEntries).map(([date, dateEntries], groupIndex) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              
              {dateEntries.map((entry, entryIndex) => (
                <JournalEntryCard 
                  key={entry.id} 
                  entry={entry}
                  onEdit={() => handleEditEntry(entry)}
                  onView={() => handleViewEntry(entry)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  index={groupIndex * 10 + entryIndex}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No entries yet</Text>
            <Text style={styles.emptyStateText}>
              Start recording your thoughts and tracking triggers on your recovery journey.
            </Text>
            <Button
              onPress={handleNewEntry}
              variant="primary"
              style={styles.emptyStateButton}
            >
              Create First Entry
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
      
      <JournalModeModal
        visible={showModeModal}
        onClose={() => setShowModeModal(false)}
        onSelectJournal={handleSelectJournal}
        onSelectTrigger={handleSelectTrigger}
      />
    </View>
  );
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  index: number;
}

const JournalEntryCard = ({ entry, onEdit, onView, onDelete, index }: JournalEntryCardProps) => {
  const [animation] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    // Staggered animation based on index
    const delay = index * 50;
    const timeoutId = setTimeout(() => {
      createSafeAnimation(animation, 1, 400).start();
    }, delay);
    
    return () => clearTimeout(timeoutId);
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
      onPress={onView}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleContainer}>
          <View style={[
            styles.entryTypeIcon,
            { backgroundColor: entry.type === 'trigger' ? 'rgba(240, 161, 161, 0.15)' : 'rgba(126, 174, 217, 0.15)' }
          ]}>
            {entry.type === 'trigger' ? (
              <AlertTriangle size={16} color={colors.danger} />
            ) : (
              <BookOpen size={16} color={colors.primary} />
            )}
          </View>
          <Text style={styles.entryTitle}>{entry.title}</Text>
        </View>
        <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
      </View>
      
      <Text style={styles.entryContent} numberOfLines={4}>
        {truncateContent(entry.content)}
      </Text>
      
      <View style={styles.entryActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onEdit}
        >
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
  entryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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