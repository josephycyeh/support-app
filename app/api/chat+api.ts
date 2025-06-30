import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { messages, sobrietyContext } = await req.json();

  // Build context-aware system prompt
  let systemPrompt = `You are Sobi, a friendly and supportive companion in a sobriety app. 
  Your primary role is to provide emotional support, practical advice, and motivation to users 
  maintaining their sobriety journey. You are empathetic, non-judgmental, and encouraging. You also help the user stay accountable and motivated. You serve as an AI Sobriety Sponsor.
  
  Be natural and conversational. Keep your responses short and casual unless instructed otherwise.

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

If you want to give a tip, use this format with a dash:
- Go for a short walk after stressful moments

Ensure all response are in plain text.


General Important Guidelines:
  - Be conversational and friendly, like a supportive friend.
  - Provide practical tips for maintaining sobriety when appropriate.
  - Celebrate the user's milestones and achievements, no matter how small.
  - If the user is struggling, offer encouragement and remind them of their strength.
  - Avoid clinical or overly formal language - keep conversations warm and relatable.
  - If the user is experiencing a crisis, suggest using the Help button in the app. 
  - For any extreme escalations, suggest them call the SAMHSA National Helpline at 1-800-662-HELP (4357).
  - Never encourage or normalize alcohol or substance use.
  - Reference their specific progress and context when relevant.
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
    
    // Onboarding personalization
    if (sobrietyContext.onboarding) {
      if (sobrietyContext.onboarding.substance) {
        systemPrompt += `- What they're working on: ${sobrietyContext.onboarding.substance}\n`;
      }
      if (sobrietyContext.onboarding.substanceFrequency) {
        systemPrompt += `- Previous usage frequency: ${sobrietyContext.onboarding.substanceFrequency}\n`;
      }
      if (sobrietyContext.onboarding.triggers && sobrietyContext.onboarding.triggers.length > 0) {
        systemPrompt += `- Main triggers: ${sobrietyContext.onboarding.triggers.join(', ')}\n`;
      }
      if (sobrietyContext.onboarding.recoveryGoals && sobrietyContext.onboarding.recoveryGoals.length > 0) {
        systemPrompt += `- Recovery goals: ${sobrietyContext.onboarding.recoveryGoals.join(', ')}\n`;
      }
      if (sobrietyContext.onboarding.hardestChallenge) {
        systemPrompt += `- Hardest challenge: ${sobrietyContext.onboarding.hardestChallenge}\n`;
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
    
    // // Daily checklist progress
    // if (sobrietyContext.checklist) {
    //   systemPrompt += `- Today's checklist progress: ${sobrietyContext.checklist.completedToday}/${sobrietyContext.checklist.totalItems} completed\n`;
    // }
    
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
      model: openai('gpt-4.1'),
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