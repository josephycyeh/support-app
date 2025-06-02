import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useMotivationStore, MOTIVATION_PACKS, MotivationPack, Quote } from '@/store/motivationStore';
import * as Haptics from 'expo-haptics';

const screenWidth = Dimensions.get('window').width;

export default function MotivationScreen() {
  const router = useRouter();
  const { setCurrentPack } = useMotivationStore();
  const [selectedPack, setSelectedPack] = useState<MotivationPack | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handlePackSelect = (pack: MotivationPack) => {
    setSelectedPack(pack);
    setCurrentPack(pack.id);
    setCurrentQuoteIndex(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBackToPacks = () => {
    setSelectedPack(null);
    setCurrentQuoteIndex(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBackToHome = () => {
    router.back();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentQuoteIndex(viewableItems[0].index || 0);
    }
  }).current;

  const renderPackList = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Motivation Packs</Text>
        <Text style={styles.headerSubtitle}>Choose inspiration for your journey</Text>
      </View>

      <View style={styles.packsContainer}>
        {MOTIVATION_PACKS.map((pack) => (
          <TouchableOpacity 
            key={pack.id}
            style={[styles.packCard, { borderLeftColor: pack.color }]}
            onPress={() => handlePackSelect(pack)}
            activeOpacity={0.8}
          >
            <View style={styles.packHeader}>
              <Text style={styles.packIcon}>{pack.icon}</Text>
              <View style={styles.packInfo}>
                <Text style={styles.packTitle}>{pack.title}</Text>
                <Text style={styles.packDescription}>{pack.description}</Text>
              </View>
            </View>
            <Text style={styles.packCount}>{pack.quotes.length} quotes</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderQuoteItem = ({ item, index }: { item: Quote; index: number }) => (
    <View style={styles.carouselItem}>
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>"{item.text}"</Text>
        {item.author && (
          <Text style={styles.quoteAuthor}>— {item.author}</Text>
        )}
      </View>
    </View>
  );

  const renderPagination = () => {
    if (!selectedPack) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {selectedPack.quotes.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentQuoteIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    );
  };

  const renderQuoteCarousel = () => {
    if (!selectedPack) return null;

    return (
      <SafeAreaView style={styles.carouselContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToPacks}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.packHeaderContent}>
          <Text style={styles.packHeaderIcon}>{selectedPack.icon}</Text>
          <Text style={styles.packHeaderTitle}>{selectedPack.title}</Text>
          <Text style={styles.packHeaderDescription}>{selectedPack.description}</Text>
        </View>

        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={selectedPack.quotes}
            renderItem={renderQuoteItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            keyExtractor={(item) => item.id}
          />
        </View>

        {renderPagination()}

        <View style={styles.navigationHint}>
          <Text style={styles.hintText}>Swipe to explore more quotes</Text>
          <Text style={styles.counterText}>
            {currentQuoteIndex + 1} of {selectedPack.quotes.length}
          </Text>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Stack.Screen 
        options={{
          title: selectedPack ? selectedPack.title : "Motivation",
          headerShown: false,
        }} 
      />
      
      {selectedPack ? renderQuoteCarousel() : renderPackList()}
    </SafeAreaView>
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  packsContainer: {
    gap: 16,
  },
  packCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  packIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  packInfo: {
    flex: 1,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  packDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  packCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  packHeaderContent: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  packHeaderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  packHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  packHeaderDescription: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  // Carousel styles
  carouselContainer: {
    flex: 1,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselItem: {
    width: screenWidth,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  quoteCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 200,
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Pagination styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Navigation hint
  navigationHint: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  hintText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  counterText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
}); 