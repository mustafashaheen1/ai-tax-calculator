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

    // Get user session

    // Get or create chat session with safe database operation
    let session = await safeDbOperation(async () => {
      if (sessionId) {
        return await prisma.chatSession.findUnique({
          where: { id: sessionId },
          include: { messages: { orderBy: { timestamp: 'asc' } } }
        });
      }
      return null;
    });

    if (!session) {
      session = await safeDbOperation(async () => {
        return await prisma.chatSession.create({
          data: {
            
          },
          include: { messages: { orderBy: { timestamp: 'asc' } } }
        });
      });
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    // Store user message with safe operation
    await safeDbOperation(async () => {
      return await prisma.chatMessage.create({
        data: {
          sessionId: session!.id,
          role: 'user',
          content: message,
        }
      });
    });

    // Prepare message history for OpenAI
    const messageHistory: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

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

    // Store AI response with safe operation
    const assistantMessage = await safeDbOperation(async () => {
      return await prisma.chatMessage.create({
        data: {
          sessionId: session!.id,
          role: 'assistant',
          content: responseContent,
        }
      });
    });

    return NextResponse.json({
      sessionId: session.id,
      message: {
        id: assistantMessage?.id || Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: assistantMessage?.timestamp || new Date(),
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
