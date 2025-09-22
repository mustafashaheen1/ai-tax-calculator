import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI tax strategy advisor for Hybrid Advisors Foundation. Provide accurate, helpful information about tax planning, charitable giving, and investment strategies. Always end with: "This is educational information only. Consult a licensed tax professional for personalized advice."`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Simple message history without database persistence
    const messageHistory: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add current user message
    messageHistory.push({ role: 'user', content: message });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messageHistory,
      max_tokens: 1000,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    // Add disclaimer if not present
    const disclaimer = "This is educational information only. Consult a licensed tax professional for personalized advice.";
    const responseContent = aiResponse.includes(disclaimer) ? aiResponse : `${aiResponse}\n\n${disclaimer}`;

    return NextResponse.json({
      sessionId: sessionId || Date.now().toString(),
      message: {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key is invalid or missing' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}