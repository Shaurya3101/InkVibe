/**
 * Helper to trigger real-time notification broadcasts by calling
 * the standalone Socket.io notification server API endpoint.
 */
export async function triggerNotificationBroadcast(
  userId: string, 
  type: 'like' | 'comment' | 'reply' | 'follow', 
  notification: any
) {
  const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
  const apiKey = process.env.SOCKET_SERVER_API_KEY || "inkvibe_realtime_secure_key_8f7b2cde7d3e5a1b";

  try {
    const res = await fetch(`${socketServerUrl}/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        userId,
        type,
        notification,
      }),
      // Fast timeout to ensure API routes aren't delayed if the socket server is starting up
      signal: AbortSignal.timeout(3000)
    });
    
    if (!res.ok) {
      console.warn(`Socket broadcast returned status: ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    console.error("Failed to broadcast real-time notification via webhook:", err);
    return null;
  }
}
