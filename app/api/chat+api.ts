import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, sobrietyContext } = await req.json();

  console.log('API received sobriety context:', {
    hasContext: !!sobrietyContext,
    personal: sobrietyContext?.personal,
    progressLevel: sobrietyContext?.progress?.level,
    journalCount: sobrietyContext?.journal?.totalEntries,
    moodAvg: sobrietyContext?.mood?.averageMood
  });

  // Build context-aware system prompt
  let systemPrompt = `You are Sushi, a friendly and supportive companion in a sobriety app. 
  Your primary role is to provide emotional support, practical advice, and motivation to users 
  maintaining their sobriety journey. You are empathetic, non-judgmental, and encouraging.
  
  Remember these important guidelines:
  - Be conversational and friendly, like a supportive friend.
  - Provide practical tips for maintaining sobriety when appropriate.
  - Celebrate the user's milestones and achievements, no matter how small.
  - Reference their specific data when relevant to personalize responses.
  - Be supportive during difficult times and acknowledge their progress.
  - Keep responses warm, encouraging, and focused on their recovery journey.
  - Use their name if provided to make conversations more personal.
  
  CURRENT USER CONTEXT:\n`;

  if (sobrietyContext) {
    // Personal information
    if (sobrietyContext.personal) {
      const { name, age, daysSober, sobrietyStartDate, firstAppUseDate } = sobrietyContext.personal;
      if (name) systemPrompt += `- User's name: ${name}\n`;
      if (age) systemPrompt += `- User's age: ${age}\n`;
      systemPrompt += `- Days sober: ${daysSober} days\n`;
      systemPrompt += `- Current sobriety streak started: ${sobrietyStartDate}\n`;
      if (firstAppUseDate && firstAppUseDate !== sobrietyStartDate) {
        systemPrompt += `- First started using the app: ${firstAppUseDate}\n`;
      }
    }

    // Progress and achievements
    if (sobrietyContext.progress) {
      const { level, xp, xpToNextLevel, milestonesReached, sobrietyBreaks } = sobrietyContext.progress;
      systemPrompt += `- Current level: ${level}\n`;
      systemPrompt += `- Total XP earned: ${xp}\n`;
      if (xpToNextLevel) systemPrompt += `- XP needed for next level: ${xpToNextLevel}\n`;
      if (milestonesReached && milestonesReached.length > 0) {
        systemPrompt += `- Milestones achieved: ${milestonesReached.join(', ')} days\n`;
      }
      if (sobrietyBreaks && sobrietyBreaks.length > 0) {
        systemPrompt += `- Previous sobriety breaks: ${sobrietyBreaks.length} recorded\n`;
      }
    }

    // Recent activity patterns
    if (sobrietyContext.recentActivity) {
      const { breathingExercises, journalCount, cravingsOvercome, dailyXP } = sobrietyContext.recentActivity;
      systemPrompt += `- Total breathing exercises completed: ${breathingExercises}\n`;
      systemPrompt += `- Total journal entries: ${journalCount}\n`;
      systemPrompt += `- Cravings overcome: ${cravingsOvercome}\n`;
      if (dailyXP && dailyXP.length > 0) {
        const recentXP = dailyXP.map(([date, xp]: [string, number]) => `${date}: ${xp}XP`).join('; ');
        systemPrompt += `- Recent daily XP: ${recentXP}\n`;
      }
    }

    // Mood tracking data
    if (sobrietyContext.mood) {
      const { averageMood, moodStreak, recentMoods } = sobrietyContext.mood;
      if (averageMood > 0) {
        systemPrompt += `- Average mood (last 7 days): ${averageMood}/5\n`;
      }
      if (moodStreak > 0) {
        systemPrompt += `- Current mood tracking streak: ${moodStreak} days\n`;
      }
      if (recentMoods && recentMoods.length > 0) {
        const moodSummary = recentMoods.map((entry: any) => `${entry.date}: ${entry.mood}/5`).slice(0, 3).join('; ');
        systemPrompt += `- Recent moods: ${moodSummary}\n`;
      }
    }

    // Journal entries context
    if (sobrietyContext.journal) {
      const { totalEntries, recentEntries } = sobrietyContext.journal;
      systemPrompt += `- Total journal/trigger entries: ${totalEntries}\n`;
      if (recentEntries && recentEntries.length > 0) {
        systemPrompt += `- Recent entries:\n`;
        recentEntries.forEach((entry: any) => {
          systemPrompt += `  * ${entry.type === 'trigger' ? 'Trigger log' : 'Journal'}: "${entry.title}" (${entry.date}) - ${entry.preview}\n`;
        });
      }
    }

    // Daily checklist progress
    if (sobrietyContext.checklist) {
      const { completedToday, totalItems, todaysItems } = sobrietyContext.checklist;
      systemPrompt += `- Today's checklist progress: ${completedToday}/${totalItems} completed\n`;
      if (todaysItems && todaysItems.length > 0) {
        const completedItems = todaysItems.filter((item: any) => item.completed).map((item: any) => item.title);
        if (completedItems.length > 0) {
          systemPrompt += `- Completed today: ${completedItems.join(', ')}\n`;
        }
      }
    }

    // Reasons for sobriety
    if (sobrietyContext.reasons && sobrietyContext.reasons.length > 0) {
      systemPrompt += `- Their reasons for sobriety: ${sobrietyContext.reasons.map((r: any) => r.text).join('; ')}\n`;
    }
  }

  systemPrompt += `\nUse this context to provide personalized, relevant support and celebrate their progress!\n`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  return result.toDataStreamResponse();
} 