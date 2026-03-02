/**
 * Face Swap API Integration
 * Server-side helpers for submitting images and polling status
 */

const FACE_SWAP_BASE_URL = 'https://api.darzh.xyz/api/method/new_face.api.face_swap';
const FACE_SWAP_TOKEN = process.env.FACE_SWAP_TOKEN || '';

interface FaceSwapSubmitResponse {
  request_id: string;
  status: 'Queued';
}

interface FaceSwapStatusResponse {
  request_id: string;
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
  image_data_url?: string;
  error?: string;
}

/**
 * Submit an image to the Face Swap API for processing
 * @param image - Base64-encoded image string (without data: prefix)
 * @param userId - Shopify session ID or UUID
 * @param customerName - Optional customer name
 * @param customerEmail - Optional customer email
 */
export async function submitFaceSwap(
  image: string,
  userId: string,
  customerName: string = '',
  customerEmail: string = ''
): Promise<FaceSwapSubmitResponse> {
  const response = await fetch(`${FACE_SWAP_BASE_URL}.process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Face-Swap-Token': FACE_SWAP_TOKEN,
    },
    body: JSON.stringify({
      image,
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Face Swap API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.message as FaceSwapSubmitResponse;
}

/**
 * Poll the Face Swap API for processing status
 * @param requestId - The request ID returned from submitFaceSwap
 */
export async function getFaceSwapStatus(
  requestId: string
): Promise<FaceSwapStatusResponse> {
  const response = await fetch(`${FACE_SWAP_BASE_URL}.get_status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Face-Swap-Token': FACE_SWAP_TOKEN,
    },
    body: JSON.stringify({
      request_id: requestId,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Face Swap status API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.message as FaceSwapStatusResponse;
}
