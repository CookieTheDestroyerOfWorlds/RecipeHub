import { type NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2/client';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@recipehub/shared';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    await verifyToken(token);
    const body = await req.json();
    const { filename, contentType } = body as { filename?: string; contentType?: string };

    if (!filename || !contentType) {
      return apiError('filename and contentType are required', 400);
    }

    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(contentType)) {
      return apiError('Unsupported content type', 400);
    }

    const ext = filename.split('.').pop() ?? 'jpg';
    const key = `uploads/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: MAX_IMAGE_SIZE_BYTES,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return success({ uploadUrl, publicUrl });
  } catch (err) {
    console.error('[POST /api/uploads/presign]', err);
    return apiError('Internal server error', 500);
  }
}
