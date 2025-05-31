import {
  StyleSheet,
  View,
  Text,
  useColorScheme,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import React, { useEffect, useState, useRef } from 'react';
import {
  AudioSession,
  BarVisualizer,
  LiveKitRoom,
  useIOSAudioManagement,
  useLocalParticipant,
  useParticipantTracks,
  useRoomContext,
  useTrackTranscription,
  useVoiceAssistant,
} from '@livekit/react-native';
import { useConnectionDetails, deleteRoom } from '@/hooks/useConnectionDetails';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Track } from 'livekit-client';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { Header } from '@/components/ui/Header';
import { Mic, MicOff, PhoneOff, Phone } from 'lucide-react-native';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

// Import all the stores like in chat
import { useSobrietyContext } from '@/hooks/useSobrietyContext';

import { registerGlobals } from '@livekit/react-native';
registerGlobals();

export default function VoiceCallScreen() {
  const [shouldConnect, setShouldConnect] = useState(false);

  // Get comprehensive sobriety context using shared hook
  const userContext = useSobrietyContext();

  // Use the connection details hook
  const { details: connectionDetails, loading: isConnecting, fetchConnectionDetails, clearDetails } = useConnectionDetails();

  // Start the audio session first.
  useEffect(() => {
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  const handleStartCall = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Fetch fresh connection details
    const details = await fetchConnectionDetails(userContext);
    
    if (details) {
      setShouldConnect(true);
    } else {
      // Handle error - could show an alert or error state
      console.error('Failed to get connection details');
    }
  };

  const handleCallEnded = () => {
    setShouldConnect(false);
    clearDetails();
  };

  const handleBackPress = async () => {
    const router = useRouter();
    
    // If we're in a call, clean up the room first
    if (shouldConnect && connectionDetails?.roomName) {
      console.log('🔄 Back pressed during call, cleaning up room...');
      await deleteRoom(connectionDetails.roomName);
    }
    
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <Header 
        title="Voice Call" 
        onBack={handleBackPress} 
      />

      {shouldConnect && connectionDetails ? (
        <LiveKitRoom
          serverUrl={connectionDetails.url}
          token={connectionDetails.token}
          connect={true}
          audio={true}
          video={false}
        >
          <RoomView onCallEnded={handleCallEnded} roomName={connectionDetails.roomName} />
        </LiveKitRoom>
      ) : (
        <CallSetupView onStartCall={handleStartCall} isConnecting={isConnecting} />
      )}
    </SafeAreaView>
  );
}

const CallSetupView = ({ onStartCall, isConnecting }: { onStartCall: () => void, isConnecting: boolean }) => {
  return (
    <View style={styles.container}>
      {/* Sushi Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={require('@/assets/images/Character_PNG.png')}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
        <Text style={styles.companionName}>Sushi</Text>
        <Text style={styles.callStatus}>
          {isConnecting ? 'Setting up call...' : 'Ready to talk'}
        </Text>
      </View>

      {/* Call Button */}
      <View style={styles.callButtonContainer}>
        <TouchableOpacity
          style={[styles.startCallButton, isConnecting && styles.startCallButtonDisabled]}
          onPress={onStartCall}
          disabled={isConnecting}
        >
          <Phone size={32} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.callButtonText}>
          {isConnecting ? 'Setting up call...' : 'Tap to start voice call'}
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {isConnecting 
            ? "Creating a secure voice connection with Sushi..."
            : "Start a voice conversation with Sushi about your recovery journey. Sushi will listen and respond with supportive guidance."
          }
        </Text>
      </View>
    </View>
  );
};

const RoomView = ({ onCallEnded, roomName }: { onCallEnded: () => void, roomName: string }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const talkingAnimationRef = useRef<LottieView>(null);

  const room = useRoomContext();
  useIOSAudioManagement(room, true);

  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  // Mute microphone by default when connected
  useEffect(() => {
    if (isConnected && localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
    }
  }, [isConnected, localParticipant]);

  // Transcriptions
  const localTracks = useParticipantTracks(
    [Track.Source.Microphone],
    localParticipant.identity
  );
  const { segments: userTranscriptions } = useTrackTranscription(
    localTracks[0]
  );

  const { agentTranscriptions } = useVoiceAssistant();

  const lastUserTranscription = (
    userTranscriptions.length > 0
      ? userTranscriptions[userTranscriptions.length - 1].text
      : ''
  ) as string;
  const lastAgentTranscription = (
    agentTranscriptions.length > 0
      ? agentTranscriptions[agentTranscriptions.length - 1].text
      : ''
  ) as string;

  // Control talking animation based on agent transcriptions
  useEffect(() => {
    if (lastAgentTranscription && talkingAnimationRef.current) {
      talkingAnimationRef.current.play();
    } else if (!lastAgentTranscription && talkingAnimationRef.current) {
      talkingAnimationRef.current.pause();
    }
  }, [lastAgentTranscription]);

  // Track connection status
  useEffect(() => {
    if (room) {
      const handleConnected = () => {
        setIsConnected(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };
      
      const handleDisconnected = () => {
        setIsConnected(false);
        onCallEnded();
      };

      room.on('connected', handleConnected);
      room.on('disconnected', handleDisconnected);

      // Check if already connected
      if (room.state === 'connected') {
        setIsConnected(true);
      }

      return () => {
        room.off('connected', handleConnected);
        room.off('disconnected', handleDisconnected);
      };
    }
  }, [room, onCallEnded]);

  // Call duration timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Delete the room (this will automatically disconnect all participants)
    console.log('🔄 Ending call and cleaning up room...');
    const deleteSuccess = await deleteRoom(roomName);
    if (!deleteSuccess) {
      console.warn('⚠️ Failed to delete room, but continuing...');
    }
    
    // No need to manually disconnect - room deletion handles this
    // The 'disconnected' event will fire automatically and call onCallEnded
  };

  const toggleMute = () => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Sushi Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <LottieView
            ref={talkingAnimationRef}
            source={require('@/assets/images/talking_opt.json')}
            style={styles.avatar}
            loop={true}
            autoPlay={false}
          />
        </View>
        <Text style={styles.companionName}>Sushi</Text>
        <Text style={styles.callStatus}>
          {isConnected ? `Connected • ${formatDuration(callDuration)}` : 'Connecting...'}
        </Text>
      </View>

      {/* Voice Visualizer */}
      <View style={styles.visualizerSection}>
        <SimpleVoiceAssistant />
        {isConnected && (
          <Text style={styles.visualizerHint}>
            Speak naturally - Sushi is listening and will respond
          </Text>
        )}
      </View>

      {/* Conversation Log */}
      <ScrollView style={styles.conversationContainer} showsVerticalScrollIndicator={false}>
        <UserTranscriptionText text={lastUserTranscription} />
        <AgentTranscriptionText text={lastAgentTranscription} />
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, !isMicrophoneEnabled && styles.mutedButton]}
          onPress={toggleMute}
        >
          {!isMicrophoneEnabled ? (
            <MicOff size={24} color="#FFF" />
          ) : (
            <Mic size={24} color={colors.primary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <PhoneOff size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {isConnected 
            ? "Speak naturally with Sushi about your recovery journey. Tap the microphone to mute yourself."
            : "Setting up your voice connection with Sushi..."
          }
        </Text>
      </View>
    </View>
  );
};

const UserTranscriptionText = (props: { text: string }) => {
  let { text } = props;
  
  return (
    text && (
      <View style={styles.userTranscriptionContainer}>
        <Text style={styles.userTranscription}>
          {text}
        </Text>
      </View>
    )
  );
};

const AgentTranscriptionText = (props: { text: string }) => {
  let { text } = props;
  
  return (
    text && (
      <View style={styles.agentTranscriptionContainer}>
        <View style={styles.agentAvatar}>
          <LottieView
            source={require('@/assets/images/talking_opt.json')}
            style={styles.agentAvatarImage}
            loop={true}
            autoPlay={true}
          />
        </View>
        <Text style={styles.agentTranscription}>{text}</Text>
      </View>
    )
  );
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <BarVisualizer
      state={state}
      barCount={7}
      options={{
        minHeight: 0.5,
      }}
      trackRef={audioTrack}
      style={styles.voiceAssistant}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
  },
  companionName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  callStatus: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  callButtonContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  startCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  startCallButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
  },
  callButtonText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  visualizerSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  voiceAssistant: {
    width: 200,
    height: 60,
    marginBottom: 8,
  },
  visualizerHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  conversationContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userTranscriptionContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userTranscription: {
    backgroundColor: colors.primary,
    color: '#FFF',
    fontSize: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
    textAlign: 'right',
  },
  agentTranscriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agentAvatar: {
    marginRight: 8,
    marginTop: 2,
  },
  agentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  agentTranscription: {
    backgroundColor: colors.cardBackground,
    color: colors.text,
    fontSize: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mutedButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  endCallButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionsText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
 