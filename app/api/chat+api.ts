import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

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

On Insights:

Keep the insight responses light, short, and conversational — like a friend texting.

When asked for insights, mention 1–2 casual but insightful observations, not a full summary.

No structured breakdowns or dive too specific. 

Feel free to connect the dots.

Sound natural.

No need to mention everything or prove you read the whole context.


On Advice and Tips:
When giving advice or tips, format the response as bullet points using dashes ( - ).

Keep the tips short, clear, and actionable.

Use best practices for sobriety: routines, managing triggers, mindfulness, healthy coping, self-care, social support, celebrating progress, etc.

Adapt tips based on the user's context (early journey, facing triggers, dealing with stress, etc).

Tone should be friendly and casual — like a supportive friend texting ideas.

Avoid sounding clinical or preachy. No long explanations — let the tips speak for themselves.

Never suggest anything that risks relapse or harm.  

Ensure all response are in plain text. For example, if you want to give a tip, use this:
- Go for a short walk after stressful moments
  `;

  // Add personalized context if available
  if (sobrietyContext) {
    systemPrompt += `\n\nCURRENT USER CONTEXT:\n`;
    
    // Personal information
    if (sobrietyContext.personal?.daysSober !== undefined) {
      systemPrompt += `- Days sober: ${sobrietyContext.personal.daysSober} days\n`;
    }
    
    if (sobrietyContext.personal?.name) {
      systemPrompt += `- Name: ${sobrietyContext.personal.name}\n`;
    }
    
    if (sobrietyContext.personal?.age) {
      systemPrompt += `- Age: ${sobrietyContext.personal.age}\n`;
    }
    
    // Progress information
    if (sobrietyContext.progress?.level) {
      systemPrompt += `- Current level: ${sobrietyContext.progress.level}\n`;
    }
    
    if (sobrietyContext.progress?.xp) {
      systemPrompt += `- Current XP: ${sobrietyContext.progress.xp}/${sobrietyContext.progress.xpToNextLevel}\n`;
    }
    
    if (sobrietyContext.progress?.milestonesReached && sobrietyContext.progress.milestonesReached.length > 0) {
      systemPrompt += `- Milestones achieved: ${sobrietyContext.progress.milestonesReached.join(', ')} days\n`;
    }
    
    // Reasons for sobriety
    if (sobrietyContext.reasons && sobrietyContext.reasons.length > 0) {
      systemPrompt += `- Their reasons for sobriety: ${sobrietyContext.reasons.map((r: any) => r.text).join('; ')}\n`;
    }
    
    // Recent activities
    if (sobrietyContext.recentActivity) {
      const activities = sobrietyContext.recentActivity;
      if (activities.breathingExercises > 0) {
        systemPrompt += `- Breathing exercises completed: ${activities.breathingExercises}\n`;
      }
      if (activities.journalCount > 0) {
        systemPrompt += `- Journal entries written: ${activities.journalCount}\n`;
      }
      if (activities.cravingsOvercome > 0) {
        systemPrompt += `- Cravings overcome: ${activities.cravingsOvercome}\n`;
      }
    }
    
    // Mood information
    if (sobrietyContext.mood?.averageMood !== null && sobrietyContext.mood?.averageMood !== undefined) {
      systemPrompt += `- Recent average mood: ${sobrietyContext.mood.averageMood.toFixed(1)}/5 (last 7 days)\n`;
    }
    
    if (sobrietyContext.mood?.moodStreak > 0) {
      systemPrompt += `- Current positive mood streak: ${sobrietyContext.mood.moodStreak} days\n`;
    }
    
    // Journal information
    if (sobrietyContext.journal?.totalEntries > 0) {
      systemPrompt += `- Total journal entries: ${sobrietyContext.journal.totalEntries}\n`;
      
      if (sobrietyContext.journal.recentEntries && sobrietyContext.journal.recentEntries.length > 0) {
        systemPrompt += `- Recent journal topics: ${sobrietyContext.journal.recentEntries.map((entry: any) => entry.title).join(', ')}\n`;
        
        systemPrompt += `\nRECENT JOURNAL ENTRIES:\n`;
        sobrietyContext.journal.recentEntries.forEach((entry: any, index: number) => {
          const entryDate = new Date(entry.date).toLocaleDateString();
          systemPrompt += `${index + 1}. "${entry.title}" (${entryDate}, ${entry.type}):\n${entry.content}\n\n`;
        });
      }
    }
    
    // Daily checklist progress
    if (sobrietyContext.checklist) {
      systemPrompt += `- Today's checklist progress: ${sobrietyContext.checklist.completedToday}/${sobrietyContext.checklist.totalItems} completed\n`;
    }
    
    // Money saved information
    if (sobrietyContext.money) {
      if (sobrietyContext.money.isConfigured) {
        systemPrompt += `- Daily spending before sobriety: ${sobrietyContext.money.currency}${sobrietyContext.money.dailySpending}\n`;
        if (sobrietyContext.money.totalSaved !== undefined) {
          systemPrompt += `- Total money saved in recovery: ${sobrietyContext.money.currency}${sobrietyContext.money.totalSaved.toLocaleString()}\n`;
        }
      }
    }
    
    // Sobriety breaks (if any)
    if (sobrietyContext.progress?.sobrietyBreaks && sobrietyContext.progress.sobrietyBreaks.length > 0) {
      systemPrompt += `- Note: User has had ${sobrietyContext.progress.sobrietyBreaks.length} previous sobriety breaks\n`;
    }
    
    systemPrompt += `\nUse this context to provide more personalized support and acknowledge their specific journey and achievements.`;
  }

  try {
    const result = await generateText({
      model: openai('gpt-4o'),
      messages,
      temperature: 0.7,
      system: systemPrompt
    });

    return Response.json({ 
      response: result.text 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 