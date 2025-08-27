import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Testing WhatsApp Configuration in Production');
  
  const config = {
    WHAPI_TOKEN: process.env.WHAPI_TOKEN,
    NEXT_PUBLIC_WHAPI_TOKEN: process.env.NEXT_PUBLIC_WHAPI_TOKEN,
    WHAPI_BASE_URL: process.env.WHAPI_BASE_URL,
    NEXT_PUBLIC_WHAPI_BASE_URL: process.env.NEXT_PUBLIC_WHAPI_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: process.env.NETLIFY,
    CONTEXT: process.env.CONTEXT
  };

  console.log('Environment variables:', {
    hasWHAPI_TOKEN: !!config.WHAPI_TOKEN,
    hasNEXT_PUBLIC_WHAPI_TOKEN: !!config.NEXT_PUBLIC_WHAPI_TOKEN,
    hasWHAPI_BASE_URL: !!config.WHAPI_BASE_URL,
    hasNEXT_PUBLIC_WHAPI_BASE_URL: !!config.NEXT_PUBLIC_WHAPI_BASE_URL,
    NODE_ENV: config.NODE_ENV,
    NETLIFY: config.NETLIFY,
    CONTEXT: config.CONTEXT
  });

  return NextResponse.json({
    environment: config.NODE_ENV,
    netlify: config.NETLIFY,
    context: config.CONTEXT,
    whapi: {
      hasToken: !!(config.WHAPI_TOKEN || config.NEXT_PUBLIC_WHAPI_TOKEN),
      hasBaseUrl: !!(config.WHAPI_BASE_URL || config.NEXT_PUBLIC_WHAPI_BASE_URL),
      tokenSource: config.WHAPI_TOKEN ? 'WHAPI_TOKEN' : config.NEXT_PUBLIC_WHAPI_TOKEN ? 'NEXT_PUBLIC_WHAPI_TOKEN' : 'none',
      baseUrlSource: config.WHAPI_BASE_URL ? 'WHAPI_BASE_URL' : config.NEXT_PUBLIC_WHAPI_BASE_URL ? 'NEXT_PUBLIC_WHAPI_BASE_URL' : 'default'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { phone = '24166871309', message = 'Test message from production' } = await request.json();
    
    const whapiToken = process.env.WHAPI_TOKEN || process.env.NEXT_PUBLIC_WHAPI_TOKEN;
    const whapiBaseUrl = process.env.WHAPI_BASE_URL || process.env.NEXT_PUBLIC_WHAPI_BASE_URL || 'https://gate.whapi.cloud';
    
    if (!whapiToken) {
      return NextResponse.json({
        success: false,
        error: 'No WHAPI token configured',
        debug: {
          hasWHAPI_TOKEN: !!process.env.WHAPI_TOKEN,
          hasNEXT_PUBLIC_WHAPI_TOKEN: !!process.env.NEXT_PUBLIC_WHAPI_TOKEN
        }
      }, { status: 400 });
    }

    console.log('🚀 Sending test WhatsApp message:', {
      phone,
      hasToken: !!whapiToken,
      baseUrl: whapiBaseUrl
    });

    const response = await fetch(`${whapiBaseUrl}/messages/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whapiToken}`
      },
      body: JSON.stringify({
        to: phone,
        body: message
      })
    });

    const result = await response.json();
    
    console.log('📱 WhatsApp API Response:', {
      status: response.status,
      ok: response.ok,
      result
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result,
      config: {
        baseUrl: whapiBaseUrl,
        hasToken: !!whapiToken
      }
    });

  } catch (error) {
    console.error('❌ Test WhatsApp Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
