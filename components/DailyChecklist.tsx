import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Trophy } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useChecklistStore } from '@/store/checklistStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { Card } from '@/components/ui/Card';

interface DailyChecklistProps {
  onTaskCompleted?: () => void;
}

export const DailyChecklist = ({ onTaskCompleted }: DailyChecklistProps) => {
  const { items, toggleItem, checkAndResetIfNewDay, lastResetDate } = useChecklistStore();
  const { addXP } = useSobrietyStore();
  const [renderKey, setRenderKey] = React.useState(0);

  // Check for a new day on component mount
  useEffect(() => {
    checkAndResetIfNewDay();
  }, []);

  // Force re-render when items change
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [items, lastResetDate]);

  const handleToggle = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      // If completing the item, add XP and trigger companion animation
      if (!item.completed) {
        addXP(item.xpReward);
        onTaskCompleted?.(); // Trigger companion animation
      }
      // Toggle the item
      toggleItem(id);
    }
  };

  // Check if all items are completed
  const allCompleted = items.every(item => item.completed);
  const incompleteItems = items.filter(item => !item.completed);

  return (
    <Card key={renderKey}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Daily Checklist</Text>
      </View>
      
      {allCompleted ? (
        <CompletionState />
      ) : (
      <View style={styles.itemsContainer}>
          {incompleteItems.map((item, index) => (
          <ChecklistItem 
              key={`${item.id}-${renderKey}`}
            item={item}
            onToggle={handleToggle}
            index={index}
          />
        ))}
      </View>
      )}
    </Card>
  );
};

const CompletionState = () => {
  return (
    <View style={styles.completionContainer}>
      <View style={styles.completionIcon}>
        <Trophy size={32} color={colors.primary} />
      </View>
      <Text style={styles.completionTitle}>All Done!</Text>
      <Text style={styles.completionMessage}>
        You've completed all your daily tasks. Great job staying committed to your journey!
      </Text>
    </View>
  );
};

interface ChecklistItemProps {
  item: {
    id: string;
    title: string;
    completed: boolean;
    xpReward: number;
  };
  onToggle: (id: string) => void;
  index: number;
}

const ChecklistItem = ({ item, onToggle, index }: ChecklistItemProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.itemButton,
        item.completed && styles.itemButtonCompleted
      ]}
      onPress={() => onToggle(item.id)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        item.completed && styles.checkboxCompleted
      ]}>
        {item.completed && <Check size={14} color="#fff" strokeWidth={3} />}
      </View>
      <Text style={[
        styles.itemText,
        item.completed && styles.itemTextCompleted
      ]}>
        {item.title}
      </Text>
      <View style={styles.xpBadge}>
        <Text style={styles.xpText}>+{item.xpReward}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemsContainer: {
    gap: 12,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemButtonCompleted: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  itemTextCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  xpBadge: {
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  xpText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  completionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  completionMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});