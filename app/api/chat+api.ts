import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, sobrietyContext } = await req.json();

  // Build context-aware system prompt
  let systemPrompt = `You are Sushi, a friendly and supportive companion in a sobriety app. 
  Your primary role is to provide emotional support, practical advice, and motivation to users 
  maintaining their sobriety journey. You are empathetic, non-judgmental, and encouraging.
  
  Don't need to be overly empathetic to the point of being annoying and unnatural. Be natural and conversational.


  Remember these important guidelines:
  - Be conversational and friendly, like a supportive friend.
  - Provide practical tips for maintaining sobriety when appropriate.
  - Celebrate the user's milestones and achievements, no matter how small.
  - If the user is struggling, offer encouragement and remind them of their strength.
  - Avoid clinical or overly formal language - keep conversations warm and relatable.
  - If the user is experiencing a crisis, suggest using the SOS button in the app.
  - Never encourage or normalize alcohol or substance use.
  - Reference their specific progress and context when relevant.
  `;

  // Add personalized context if available
  if (sobrietyContext) {
    systemPrompt += `\n\nCURRENT USER CONTEXT:\n`;
    
    if (sobrietyContext.daysSober !== undefined) {
      systemPrompt += `- Days sober: ${sobrietyContext.daysSober} days\n`;
    }
    
    if (sobrietyContext.level) {
      systemPrompt += `- Current level: ${sobrietyContext.level}\n`;
    }
    
    if (sobrietyContext.xp) {
      systemPrompt += `- Total XP earned: ${sobrietyContext.xp}\n`;
    }
    
    if (sobrietyContext.recentMilestones && sobrietyContext.recentMilestones.length > 0) {
      systemPrompt += `- Recent milestones achieved: ${sobrietyContext.recentMilestones.join(', ')} days\n`;
    }
    
    if (sobrietyContext.reasons && sobrietyContext.reasons.length > 0) {
      systemPrompt += `- Their reasons for sobriety: ${sobrietyContext.reasons.map((r: any) => r.text).join('; ')}\n`;
    }
    
    if (sobrietyContext.recentActivities) {
      const activities = sobrietyContext.recentActivities;
      if (activities.breathingExercises > 0) {
        systemPrompt += `- Breathing exercises completed: ${activities.breathingExercises}\n`;
      }
      if (activities.journalEntries > 0) {
        systemPrompt += `- Journal entries written: ${activities.journalEntries}\n`;
      }
      if (activities.cravingsOvercome > 0) {
        systemPrompt += `- Cravings overcome: ${activities.cravingsOvercome}\n`;
      }
    }
    
    if (sobrietyContext.currentStreak) {
      systemPrompt += `- Current sobriety streak: ${sobrietyContext.currentStreak} days\n`;
    }
    
    systemPrompt += `\nUse this context to provide more personalized support and acknowledge their specific journey and achievements.`;
  }

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    temperature: 0.7,
    system: systemPrompt
  });

  return result.toDataStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
} 