import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import prisma, { safeDbOperation } from '../../../lib/database';

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

    // Get or create chat session with safe database operation
    let session = null;
    
    if (sessionId) {
      session = await safeDbOperation(async () => {
        return await prisma.chatSession.findUnique({
          where: { id: sessionId },
          include: { messages: { orderBy: { timestamp: 'asc' } } }
        });
      });
    }

    if (!session) {
      session = await safeDbOperation(async () => {
        return await prisma.chatSession.create({
          data: {},
          include: { messages: { orderBy: { timestamp: 'asc' } } }
        });
      });
    }

    // If database operations fail, continue without session persistence
    const messageHistory: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add previous messages if session exists
    if (session?.messages) {
      messageHistory.push(
        ...session.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      );
    }

    // Add current user message
    messageHistory.push({ role: 'user', content: message });

    // Store user message if session exists
    if (session) {
      await safeDbOperation(async () => {
        return await prisma.chatMessage.create({
          data: {
            sessionId: session!.id,
            role: 'user',
            content: message,
          }
        });
      });
    }

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

    // Store AI response if session exists
    let assistantMessage = null;
    if (session) {
      assistantMessage = await safeDbOperation(async () => {
        return await prisma.chatMessage.create({
          data: {
            sessionId: session!.id,
            role: 'assistant',
            content: responseContent,
          }
        });
      });
    }

    return NextResponse.json({
      sessionId: session?.id || Date.now().toString(),
      message: {
        id: assistantMessage?.id || Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: assistantMessage?.timestamp || new Date(),
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