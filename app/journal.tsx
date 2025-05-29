import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Edit, Trash2, AlertTriangle, BookOpen, MoreHorizontal } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useJournalStore, JournalEntry } from '@/store/journalStore';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { JournalModeModal } from '@/components/JournalModeModal';

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
    
    // First sort all entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    sortedEntries.forEach(entry => {
      const dateKey = formatDate(entry.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });
    
    // Sort entries within each date group by time (newest first)
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
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
          Object.entries(groupedEntries)
            .sort(([dateA], [dateB]) => {
              // Sort date groups by the first entry's date (newest first)
              const firstEntryA = groupedEntries[dateA][0];
              const firstEntryB = groupedEntries[dateB][0];
              return new Date(firstEntryB.date).getTime() - new Date(firstEntryA.date).getTime();
            })
            .map(([date, dateEntries], groupIndex) => (
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
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  const menuButtonRef = React.useRef<TouchableOpacity>(null);
  
  const handleMenuPress = (e: any) => {
    e.stopPropagation();
    
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuPosition({
          x: pageX - 120, // Position menu to the left of the button
          y: pageY + height + 5, // Position below the button with small gap
        });
        setShowMenu(true);
      });
    }
  };

  const handleEditPress = () => {
    setShowMenu(false);
    onEdit();
  };

  const handleDeletePress = () => {
    setShowMenu(false);
    onDelete();
  };
  
  // Render content based on entry type
  const renderContent = () => {
    if (entry.type === 'trigger') {
      const lines = entry.content.split('\n\n');
      const triggerMatch = lines[0]?.match(/Trigger: (.+)/);
      const intensityMatch = lines[1]?.match(/Intensity: (\d+)\/10/);
      const outcomeMatch = lines[3]?.match(/Outcome: (.+)/);
      
      return (
        <View style={styles.triggerContent}>
          <Text style={styles.triggerText} numberOfLines={2}>
            {lines[0]?.match(/Trigger: (.+)/)?.[1] || ''}
          </Text>
          
          <View style={styles.triggerDetails}>
            <View style={styles.intensitySection}>
              <Text style={styles.intensityLabel}>Intensity</Text>
              <View style={styles.intensityBarContainer}>
                <View style={styles.intensityBarBackground}>
                  <View 
                    style={[
                      styles.intensityBarFill, 
                      { 
                        width: `${(parseInt(intensityMatch?.[1] || '5') / 10) * 100}%`,
                        backgroundColor: parseInt(intensityMatch?.[1] || '5') <= 3 ? '#10B981' : parseInt(intensityMatch?.[1] || '5') <= 6 ? '#F59E0B' : '#EF4444'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.intensityValue}>{parseInt(intensityMatch?.[1] || '5')}/10</Text>
              </View>
            </View>
            
            <View style={styles.outcomeSection}>
              <Text style={styles.outcomeLabel}>Outcome</Text>
              <Text style={styles.outcomeValue}>
                {outcomeMatch?.[1] === 'Stayed Strong' ? 'Stayed Strong' : 'Relapsed'}
              </Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <Text style={styles.entryContent} numberOfLines={2}>
          {entry.content}
        </Text>
      );
    }
  };
  
  return (
    <>
      <TouchableOpacity 
        style={styles.entryCard}
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
        </View>
        
        {renderContent()}

        <View style={styles.entryFooter}>
          <Text style={styles.entryDate}>{new Date(entry.date).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleMenuPress}
            ref={menuButtonRef}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreHorizontal size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { left: menuPosition.x, top: menuPosition.y }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleEditPress}
            >
              <Edit size={18} color={colors.primary} />
              <Text style={styles.menuItemText}>Edit</Text>
            </TouchableOpacity>
            
            <View style={styles.menuSeparator} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleDeletePress}
            >
              <Trash2 size={18} color={colors.danger} />
              <Text style={[styles.menuItemText, { color: colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  entryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryTypeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
  entryContent: {
    fontSize: 15,
    color: colors.textLight,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  // Trigger-specific styles
  triggerContent: {
    marginBottom: 16,
  },
  triggerText: {
    fontSize: 15,
    color: colors.textLight,
    lineHeight: 22,
    marginBottom: 18,
    fontWeight: '400',
  },
  triggerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingTop: 2,
  },
  intensitySection: {
    flex: 1,
  },
  intensityLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  intensityBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intensityBarBackground: {
    flex: 0.7,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  intensityBarFill: {
    height: '100%',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  intensityValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '800',
    minWidth: 32,
    textAlign: 'right',
  },
  outcomeSection: {
    alignItems: 'flex-start',
    flex: 0.8,
  },
  outcomeLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  outcomeValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 16,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  entryDate: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
    borderRadius: 12,
  },
  // Menu styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});