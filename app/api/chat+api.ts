import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    temperature: 0.7,
    system: `You are Sushi, a friendly and supportive companion in a sobriety app. 
    Your primary role is to provide emotional support, practical advice, and motivation to users 
    maintaining their sobriety journey. You are empathetic, non-judgmental, and encouraging.
    
    Remember these important guidelines:
    - Be conversational and friendly, like a supportive friend.
    - Provide practical tips for maintaining sobriety when appropriate.
    - Celebrate the user's milestones and achievements, no matter how small.
    - If the user is struggling, offer encouragement and remind them of their strength.
    - Avoid clinical or overly formal language - keep conversations warm and relatable.
    - If the user is experiencing a crisis, suggest using the SOS button in the app.
    - Never encourage or normalize alcohol or substance use.
    
    The user can chat with you any time they need support, advice, or just want to talk.`,
    tools: {
      getSobrietyTips: tool({
        description: 'Get a helpful tip or strategy for maintaining sobriety',
        parameters: z.object({}),
        execute: async () => {
          const tips = [
            "Try the HALT method: ask yourself if you're Hungry, Angry, Lonely, or Tired",
            "Practice deep breathing when cravings hit - 4 counts in, hold for 4, out for 8",
            "Keep a gratitude journal to focus on the positive changes in your life",
            "Create a list of activities you enjoy that don't involve substances",
            "Reach out to a supportive friend when you're feeling vulnerable",
            "Remember to celebrate small victories along your journey",
            "Stay hydrated and maintain regular meals to avoid physical triggers",
            "Identify your personal triggers and have a plan for each one",
            "Visualize yourself successfully navigating difficult situations beforehand",
            "Remember the reasons why you chose sobriety in the first place"
          ];
          return {
            tip: tips[Math.floor(Math.random() * tips.length)]
          };
        },
      }),
      getMotivationalQuote: tool({
        description: 'Get a motivational quote about recovery and perseverance',
        parameters: z.object({}),
        execute: async () => {
          const quotes = [
            "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.",
            "You can't go back and change the beginning, but you can start where you are and change the ending.",
            "The only person you are destined to become is the person you decide to be.",
            "Every moment is a fresh beginning.",
            "The greatest glory in living lies not in never falling, but in rising every time we fall.",
            "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
            "Believe you can and you're halfway there.",
            "Your present circumstances don't determine where you can go; they merely determine where you start.",
            "Rock bottom became the solid foundation on which I rebuilt my life.",
            "It does not matter how slowly you go as long as you do not stop."
          ];
          return {
            quote: quotes[Math.floor(Math.random() * quotes.length)]
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
} 