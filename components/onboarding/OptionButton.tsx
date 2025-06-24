import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface OptionButtonProps {
  // Required props
  label: string;
  onPress: () => void;
  
  // Selection state
  isSelected?: boolean;
  
  // Enhanced option with icon and description
  icon?: string | React.ReactElement;
  description?: string;
  
  // Auto-advance after selection (opinionated default: false)
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  
  // Custom styles
  style?: any;
  textStyle?: any;
  
  // Accessibility
  accessibilityLabel?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  onPress,
  isSelected = false,
  icon,
  description,
  autoAdvance = false,
  autoAdvanceDelay = 500,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    // Haptic feedback is opinionated - always included
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
    
    // Optional auto-advance
    if (autoAdvance) {
      setTimeout(() => {
        // This would need to be passed down or handled by parent
        // For now, just the selection logic
      }, autoAdvanceDelay);
    }
  };

  // Determine if this is an enhanced option with icon
  const isEnhanced = Boolean(icon || description);

  if (isEnhanced) {
    return (
      <TouchableOpacity
        style={[
          styles.optionButtonWithIcon,
          isSelected && styles.optionButtonWithIconSelected,
          style
        ]}
        onPress={handlePress}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.optionContentWithIcon}>
          {icon && (
            <View style={styles.optionIconContainer}>
              {typeof icon === 'string' ? (
                <Text style={styles.optionEmoji}>{icon}</Text>
              ) : (
                icon
              )}
            </View>
          )}
          <View style={styles.optionTextContainer}>
            <Text style={[
              styles.optionTitle,
              isSelected && styles.optionTitleSelected,
              textStyle
            ]}>
              {label}
            </Text>
            {description && (
              <Text style={[
                styles.optionDescription,
                isSelected && styles.optionDescriptionSelected
              ]}>
                {description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Standard option button
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        isSelected && styles.optionButtonSelected,
        style
      ]}
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={[
        styles.optionText,
        isSelected && styles.optionTextSelected,
        textStyle
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Standard option button styles
  optionButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'left',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },

  // Enhanced option button styles (with icon/description)
  optionButtonWithIcon: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  optionButtonWithIconSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionContentWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textLight,
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

// Utility component for option containers
export const OptionsContainer: React.FC<{ children: React.ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <View style={[{ width: '100%', gap: 12 }, style]}>
    {children}
  </View>
); 