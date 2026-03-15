import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimits, getClientIp } from '@/lib/faceswap';

export async function POST(request: NextRequest) {
    try {
        const clientIp = getClientIp(request);
        const response = await checkRateLimits(clientIp);

        return NextResponse.json({ message: response });
    } catch (error) {
        console.error('[API] Face swap rate limit check error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to check rate limits' },
            { status: 500 }
        );
    }
}
