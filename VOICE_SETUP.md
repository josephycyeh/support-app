# Voice Calling Setup Guide

This guide will help you set up voice calling functionality in your Sushi Support App using LiveKit.

## 🎯 What's Been Added

### 1. **Voice Call Screen** (`/voice-call`)
- Beautiful UI with Sushi's avatar
- Call controls (start, end, mute)
- Call duration timer
- Connection status indicators

### 2. **Chat Integration**
- Voice call button in chat header (top right)
- Seamless navigation between text and voice

### 3. **LiveKit Configuration**
- Expo plugins configured in `app.json`
- Global registration in app layout
- Connection management hook

## 🚀 Setup Instructions

### Step 1: LiveKit Cloud Account
1. Go to [LiveKit Cloud](https://cloud.livekit.io)
2. Create a free account
3. Create a new project
4. Note your project credentials

### Step 2: Configure Sandbox (Development)
1. In your LiveKit Cloud project, create a **Sandbox Token Server**
2. Copy the Sandbox ID
3. Update `hooks/useConnectionDetails.ts`:
   ```typescript
   const SANDBOX_ID = 'your-actual-sandbox-id'; // Replace this
   ```

### Step 3: Build with Development Client
Since LiveKit requires native code, you can't use Expo Go:

```bash
# Install development build
npx expo install expo-dev-client

# Build for iOS
npx expo run:ios

# Build for Android  
npx expo run:android
```

### Step 4: Test Voice Calling
1. Open the app
2. Navigate to chat screen
3. Tap the phone icon (top right)
4. Tap the call button to start

## 🔧 Production Setup

For production, you'll need your own token server:

### 1. Create Token Generation API
```typescript
// Example: app/api/livekit-token+api.ts
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: Request) {
  const { room, identity } = await req.json();
  
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity }
  );
  
  token.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
  
  return Response.json({
    token: token.toJwt(),
    url: process.env.LIVEKIT_URL
  });
}
```

### 2. Update Connection Hook
```typescript
// In hooks/useConnectionDetails.ts
const response = await fetch('/api/livekit-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    room: 'sushi-voice-call',
    identity: `user-${Date.now()}`
  }),
});
```

## 🎙️ AI Voice Integration

To connect with your OpenAI chat:

### Option 1: Voice → Text → AI → Text → Voice
1. Use speech-to-text for user input
2. Send text to your existing OpenAI endpoint
3. Use text-to-speech for AI response

### Option 2: Real-time Voice AI (Advanced)
1. Use OpenAI's real-time API
2. Stream audio directly to/from AI
3. More complex but more natural

## 🔍 Current Status

**✅ Implemented:**
- Voice call UI and navigation
- LiveKit configuration
- Basic call controls
- Connection management

**🚧 Next Steps:**
1. Set up LiveKit Cloud account
2. Configure sandbox/production tokens
3. Test voice connectivity
4. Integrate with AI responses

## 🆘 Troubleshooting

### "Failed to connect" Error
- Check your Sandbox ID in `useConnectionDetails.ts`
- Verify LiveKit Cloud project is active
- Ensure you're using development build (not Expo Go)

### Audio Not Working
- Check device permissions
- Test on physical device (not simulator)
- Verify audio session is started

### Build Errors
- Run `npx expo install --fix` to resolve dependencies
- Clear cache: `npx expo start --clear`
- Rebuild: `npx expo run:ios --clear`

## 📚 Resources

- [LiveKit React Native Docs](https://docs.livekit.io/home/quickstarts/expo/)
- [LiveKit Voice Assistant Example](https://github.com/livekit-examples/voice-assistant-react-native)
- [LiveKit Cloud Dashboard](https://cloud.livekit.io)

---

**Ready to test?** Start with the sandbox setup and tap that phone button! 📞 