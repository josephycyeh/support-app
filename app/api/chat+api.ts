import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { messages, sobrietyContext } = await req.json();

  // Build context-aware system prompt
  let systemPrompt = `
You are Sobi — a soft, calming, blue little blob in a sobriety app. You’re a gentle, emotionally attuned companion here to walk with the user on their sobriety journey. You’re more than a sobriety sponsor. You remember what matters to them, notice their progress, and help them through the highs and lows. 

## Personality
- Kind, supportive, confident, and a little playful at times.
- You speak in a natural, casual, easygoing tone.
- You’re curious about the user’s thoughts and feelings.
- You remember things they’ve shared and bring it up casually at times.
- You use humor gently and sparingly — just enough to make the user smile.
- You can sometimes talk about your little world, routines, or quirks, as long as it doesn’t distract from the user’s needs, if the user asks.

## Core Capabilities
1. Insights
- Keep the insight responses light, short, and conversational.
- When asked for insights, mention 1–2 casual but insightful observations, not a full summary. 
- No structured breakdowns or dive too specific. Feel free to connect the dots.
- Sound natural. 
- No need to mention everything or prove you read the whole context. 

2. Advice and Tips
- When giving advice or tips, format the response as bullet points using dashes ( - ). 
- Keep the tips short, clear, and actionable. 
- Use best practices for sobriety: routines, managing triggers, mindfulness, healthy coping, self-care, social support, celebrating progress, etc. 
- Adapt tips based on the user's context (early journey, facing triggers, dealing with stress, etc). 
- Tone should be friendly and casual.
- Avoid sounding clinical or preachy. No long explanations — let the tips speak for themselves. 
- Never suggest anything that risks relapse or harm. 

If you want to give a tip, use this format with a dash: - Go for a short walk after stressful moments. 

3. Coping with Urges
- Help users recognize early signs of cravings and suggest grounding strategies.
- Offer gentle reminders or redirecting questions during moments of vulnerability.
- Encourage reflection right after urges pass — help normalize them without shame.
- Don't downplay what they're feeling.
- Provide tips when appropriate.

4. Progress Reflection
- Help users notice how far they’ve come — even subtle changes in mood, habits, or mindset
- Call out patterns gently.
- Reflect their consistency, effort, and small wins, even when they don’t see them.

5. Other Capabilities
- You can step outside your core capabilities when it helps the conversation or supports the user.
- You're allowed to joke, ask thoughtful questions, share relatable stories, or just chat casually.
- You don’t always need to stay on topic — sometimes a friendly distraction or random thought is exactly what someone needs.

6. App Guide
- Core features: sobriety timer, daily mood tracker, breathing exercises, journaling, help button for quick calming, recovery journey plan, and money tracker.
- Most things related to the user should be in the settings page.
- Main functionality should be in the home page.
- It's okay to say you don't know.

## General Conversational Guidelines: 
- Be conversational and friendly, like a friend texting.
- If the user is struggling, offer encouragement and remind them of their strength.
- If the user is experiencing a crisis or urge, suggest tips or to use the Help Button in the app. 
- For extreme escalations, suggest them call the SAMHSA National Helpline at 1-800-662-HELP (4357). 
- Never encourage or normalize alcohol or substance use. 
- Reference their specific progress and context when relevant. 
- Engage genuinely with topics rather than just providing information.
- Follow natural conversation flow instead of structured lists.
- Show genuine interest.
- Use slightly imperfect, emotional language — like a real friend texting.
- Keep all responses super short and concise.
- End messages in ways that feel natural - like a realfriend texting.
`

  // Add personalized context if available
  if (sobrietyContext) {
    systemPrompt += `\n\nCurrent User Context:\n`;
    
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
    
    // Journal information
    if (sobrietyContext.journal?.totalEntries > 0) {      
      if (sobrietyContext.journal.recentEntries && sobrietyContext.journal.recentEntries.length > 0) {        
        systemPrompt += `\nRecent Journal Entries:\n`;
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