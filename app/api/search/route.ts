import { NextRequest, NextResponse } from 'next/server';
import { searchStocks } from '@/lib/actions/finnhub.actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Validate API key server-side by checking if it's available
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (!finnhubKey) {
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Call the server-side searchStocks function
    const results = await searchStocks(query);

    // Return JSON response with appropriate cache headers
    return NextResponse.json(
      { results },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'Content-Type': 'application/json',
        },
      }
    );
  } 
  catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}