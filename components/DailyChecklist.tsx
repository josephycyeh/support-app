import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Trophy, Target } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useChecklistStore } from '@/store/checklistStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { Card } from '@/components/ui/Card';
import * as Haptics from 'expo-haptics';

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
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Target size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Daily Goals</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Complete these healthy habits to earn XP and strengthen your recovery
          </Text>
        </View>
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
        <Trophy size={28} color={colors.primary} />
      </View>
      <Text style={styles.completionTitle}>All Goals Completed!</Text>
      <Text style={styles.completionMessage}>
        Excellent work! You've completed all your daily goals. Your commitment to recovery is inspiring.
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
        {item.completed && <Check size={16} color="#fff" strokeWidth={2.5} />}
      </View>
      <Text style={[
        styles.itemText,
        item.completed && styles.itemTextCompleted
      ]}>
        {item.title}
      </Text>
      <View style={styles.xpBadge}>
        <Text style={styles.xpText}>+{item.xpReward} XP</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 8,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    ...typography.h3,
    marginLeft: 8,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    marginTop: 4,
  },
  itemsContainer: {
    gap: 16,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemButtonCompleted: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    opacity: 0.7,
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
    lineHeight: 22,
  },
  itemTextCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  xpBadge: {
    backgroundColor: 'rgba(107, 152, 194, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  xpText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  completionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(107, 152, 194, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionTitle: {
    ...typography.h2,
    marginBottom: 12,
  },
  completionMessage: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },
});