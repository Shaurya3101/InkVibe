/**
 * Helper to upload a file directly to Cloudinary from the client
 * using secure backend signed request params.
 */
export async function uploadToCloudinary(file: File, folder = "inkvibe"): Promise<string> {
  try {
    // 1. Fetch secure signature from Next.js backend
    const signRes = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folder }),
    });

    if (!signRes.ok) {
      throw new Error("Failed to authorize file upload request");
    }

    const { signature, timestamp, cloudName, apiKey } = await signRes.json();

    // 2. Build form payload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("folder", folder);

    // 3. Post directly to Cloudinary API endpoint
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      const errData = await uploadRes.json();
      throw new Error(errData.error?.message || "Failed to upload image file");
    }

    const uploadData = await uploadRes.json();
    return uploadData.secure_url; // Returns the public optimized image URL
  } catch (err: any) {
    console.error("Cloudinary upload client helper error:", err);
    throw err;
  }
}
