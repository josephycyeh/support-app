import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import colors from '@/constants/colors';
import { MessageCircle, Heart, Award } from 'lucide-react-native';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Community",
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSubtitle}>Connect with others on their journey</Text>
        </View>
        
        {/* Community Posts */}
        <View style={styles.postsContainer}>
          <CommunityPost 
            name="Sarah M."
            avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            time="2 hours ago"
            content="Just completed my first week sober! The breathing exercises have been a lifesaver during tough moments."
            likes={24}
            comments={8}
            achievement="1 Week Milestone"
          />
          
          <CommunityPost 
            name="Michael T."
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            time="Yesterday"
            content="Had a really strong craving today but talked to Sobi and went for a walk instead. Proud of myself for making it through."
            likes={42}
            comments={15}
          />
          
          <CommunityPost 
            name="Jamie L."
            avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            time="2 days ago"
            content="30 days sober today! I never thought I'd make it this far. Thank you all for the support along the way."
            likes={87}
            comments={32}
            achievement="30 Day Milestone"
          />
        </View>
        
        <View style={styles.joinContainer}>
          <Text style={styles.joinText}>Join the conversation and get support from others on similar journeys.</Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

interface PostProps {
  name: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  achievement?: string;
}

const CommunityPost = ({ name, avatar, time, content, likes, comments, achievement }: PostProps) => (
  <View style={styles.postContainer}>
    <View style={styles.postHeader}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.postHeaderText}>
        <Text style={styles.postName}>{name}</Text>
        <Text style={styles.postTime}>{time}</Text>
      </View>
    </View>
    
    <Text style={styles.postContent}>{content}</Text>
    
    {achievement && (
      <View style={styles.achievementContainer}>
        <Award size={16} color={colors.primary} />
        <Text style={styles.achievementText}>{achievement}</Text>
      </View>
    )}
    
    <View style={styles.postActions}>
      <TouchableOpacity style={styles.actionButton}>
        <Heart size={18} color={colors.textLight} />
        <Text style={styles.actionText}>{likes}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <MessageCircle size={18} color={colors.textLight} />
        <Text style={styles.actionText}>{comments}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  postsContainer: {
    gap: 20,
  },
  postContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  postHeaderText: {
    flex: 1,
  },
  postName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  postTime: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 174, 217, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  achievementText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  joinContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});