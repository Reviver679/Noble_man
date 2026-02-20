import { NextRequest, NextResponse } from 'next/server';
import { submitFaceSwap } from '@/lib/faceswap';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, user_id } = body;

        if (!image || !user_id) {
            return NextResponse.json(
                { error: 'Missing required fields: image, user_id' },
                { status: 400 }
            );
        }

        // Strip data URL prefix if present (e.g., "data:image/png;base64,")
        const base64Image = image.includes(',') ? image.split(',')[1] : image;

        const result = await submitFaceSwap(
            base64Image,
            user_id,
            body.customer_name || '',
            body.customer_email || ''
        );

        return NextResponse.json({
            message: result,
        });
    } catch (error) {
        console.error('[API] Face swap process error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to submit face swap' },
            { status: 500 }
        );
    }
}
