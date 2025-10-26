const STORE_ID_REGEX = /vercel_blob_(?:rw|ro)_([A-Za-z0-9]+)_/i;

/**
 * Extract the Vercel Blob store ID from the environment.
 * Prefers the public environment variable when provided.
 */
export function getBlobStoreIdFromEnv(): string | null {
  const publicStoreId = process.env.NEXT_PUBLIC_BLOB_STORE_ID;
  if (publicStoreId) {
    return publicStoreId;
  }

  const tokens = [
    process.env.BLOB_READ_WRITE_TOKEN,
    process.env.BLOB_READ_TOKEN,
    process.env.BLOB_READ_ONLY_TOKEN,
  ];

  for (const token of tokens) {
    if (!token) continue;
    const match = token.match(STORE_ID_REGEX);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Build the Blob Storage URL for a given slide ID.
 */
export function buildBlobUrl(slideId: string): string | null {
  const storeId = getBlobStoreIdFromEnv();
  if (!storeId) {
    return null;
  }

  return `https://${storeId}.public.blob.vercel-storage.com/${slideId}.html`;
}
