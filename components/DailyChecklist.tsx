import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useChecklistStore } from '@/store/checklistStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { Card } from '@/components/ui/Card';
import { createSafeAnimation } from '@/utils/animations';

export const DailyChecklist = () => {
  const { items, toggleItem, checkAndResetIfNewDay } = useChecklistStore();
  const { addXP } = useSobrietyStore();

  // Check for a new day on component mount
  useEffect(() => {
    checkAndResetIfNewDay();
  }, []);

  const handleToggle = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      // If completing the item, add XP
      if (!item.completed) {
        addXP(item.xpReward);
      }
      // Toggle the item
      toggleItem(id);
    }
  };

  return (
    <Card>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Daily Checklist</Text>
      </View>
      
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <ChecklistItem 
            key={item.id}
            item={item}
            onToggle={handleToggle}
            index={index}
          />
        ))}
      </View>
    </Card>
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
  // Animation for staggered entry
  const [animation] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    // Stagger the animation of each item
    createSafeAnimation(animation, 1, 400, undefined).start();
  }, []);
  
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
      style={[
        styles.itemButton,
        item.completed && styles.itemButtonCompleted,
        animationStyle
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
    </AnimatedTouchable>
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
});