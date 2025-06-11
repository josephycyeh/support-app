import React from 'react';
import { OptionButton, OptionsContainer } from './OptionButton';

interface MultiSelectOptionsProps {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (newSelection: string[]) => void;
  maxSelections?: number;
  minSelections?: number;
}

export const MultiSelectOptions: React.FC<MultiSelectOptionsProps> = ({
  options,
  selectedOptions,
  onSelectionChange,
  maxSelections,
  minSelections = 0
}) => {
  const toggleOption = (option: string) => {
    let newSelection: string[];
    
    if (selectedOptions.includes(option)) {
      // Remove option (but respect minimum)
      newSelection = selectedOptions.filter(item => item !== option);
      if (minSelections && newSelection.length < minSelections) {
        return; // Don't allow removal if it would go below minimum
      }
    } else {
      // Add option (but respect maximum)
      if (maxSelections && selectedOptions.length >= maxSelections) {
        return; // Don't allow addition if at maximum
      }
      newSelection = [...selectedOptions, option];
    }
    
    onSelectionChange(newSelection);
  };

  return (
    <OptionsContainer>
      {options.map((option, index) => (
        <OptionButton
          key={index}
          label={option}
          isSelected={selectedOptions.includes(option)}
          onPress={() => toggleOption(option)}
        />
      ))}
    </OptionsContainer>
  );
};

// Single select variant for simpler use cases
interface SingleSelectOptionsProps {
  options: string[];
  selectedOption: string;
  onSelectionChange: (selection: string) => void;
  autoAdvance?: boolean;
}

export const SingleSelectOptions: React.FC<SingleSelectOptionsProps> = ({
  options,
  selectedOption,
  onSelectionChange,
  autoAdvance = false
}) => {
  return (
    <OptionsContainer>
      {options.map((option, index) => (
        <OptionButton
          key={index}
          label={option}
          isSelected={selectedOption === option}
          onPress={() => onSelectionChange(option)}
          autoAdvance={autoAdvance}
        />
      ))}
    </OptionsContainer>
  );
}; 