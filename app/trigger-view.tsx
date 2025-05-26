import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Edit3, AlertTriangle } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useJournalStore } from '@/store/journalStore';
import { Header } from '@/components/ui/Header';

export default function TriggerViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const entryId = typeof params.id === 'string' ? params.id : '';
  
  const { getEntries } = useJournalStore();
  const [entry, setEntry] = useState<any>(null);
  
  // Refresh entry data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const entries = getEntries();
      const foundEntry = entries.find(e => e.id === entryId);
      setEntry(foundEntry);
    }, [entryId, getEntries])
  );
  
  const handleEdit = () => {
    if (entry) {
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
    }
  };
  
  if (!entry) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Trigger Log", headerShown: false }} />
        <Header title="Trigger Log" onBack={() => router.back()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Trigger log not found</Text>
        </View>
      </View>
    );
  }
  
  // Parse the trigger content
  const lines = entry.content.split('\n\n');
  const triggerMatch = lines[0]?.match(/Trigger: (.+)/);
  const intensityMatch = lines[1]?.match(/Intensity: (\d+)\/10/);
  const copingMatch = lines[2]?.match(/Coping Strategy: (.+)/);
  const outcomeMatch = lines[3]?.match(/Outcome: (.+)/);
  
  const trigger = triggerMatch?.[1] || '';
  const intensity = intensityMatch?.[1] || '5';
  const copingStrategy = copingMatch?.[1] || '';
  const outcome = outcomeMatch?.[1] || '';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Trigger Log",
          headerShown: false,
        }} 
      />
      
      <Header 
        title="Trigger Log" 
        onBack={() => router.back()}
        rightComponent={
          <TouchableOpacity 
            onPress={handleEdit}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Edit3 size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={24} color={colors.danger} />
          </View>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
        </View>
        
        <View style={styles.contentSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Trigger</Text>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldText}>{trigger}</Text>
            </View>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Intensity</Text>
            <View style={styles.intensityContainer}>
              <View style={styles.intensityScale}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <View
                    key={num}
                    style={[
                      styles.intensityDot,
                      num <= parseInt(intensity) && styles.intensityDotActive
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.intensityText}>{intensity}/10</Text>
            </View>
          </View>
          
          {copingStrategy && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Coping Strategy</Text>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldText}>{copingStrategy}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Outcome</Text>
            <View style={styles.outcomeContainer}>
              <View style={[
                styles.outcomeIndicator,
                { backgroundColor: outcome === 'Stayed Strong' ? colors.success : colors.danger }
              ]}>
                <Text style={styles.outcomeEmoji}>
                  {outcome === 'Stayed Strong' ? '💪' : '😢'}
                </Text>
                <Text style={styles.outcomeText}>{outcome}</Text>
              </View>
            </View>
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
    padding: 20,
    paddingTop: 10,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(240, 161, 161, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  contentSection: {
    gap: 24,
  },
  fieldContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  fieldContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  intensityContainer: {
    alignItems: 'center',
    gap: 12,
  },
  intensityScale: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  intensityDotActive: {
    backgroundColor: colors.danger,
  },
  intensityText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.danger,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
  },
  outcomeContainer: {
    alignItems: 'center',
    gap: 12,
  },
  outcomeIndicator: {
    width: 140,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outcomeEmoji: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  outcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 