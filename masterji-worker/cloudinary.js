const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function json(status, body) {
  return { status, body };
}

async function signParams(params, secret) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(`${serialized}${secret}`),
  );
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function requireConfig(env) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured.");
  }
}

export async function uploadCloudinaryFile(request, env, user) {
  try {
    requireConfig(env);
    const form = await request.formData();
    const file = form.get("file");
    const noteId = String(form.get("noteId") || "");
    if (!file || typeof file.arrayBuffer !== "function" || !noteId) return json(400, { error: "A note ID and file are required." });
    if (file.size > MAX_FILE_SIZE) return json(413, { error: "Please use a file smaller than 20 MB." });
    if (!file.type.startsWith("image/") && !ALLOWED_TYPES.has(file.type)) return json(400, { error: "Unsupported file type." });

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `notes/${user.sub}`;
    const publicId = noteId;
    const resourceType = file.type.startsWith("image/") ? "image" : "raw";
    const params = { folder, public_id: publicId, timestamp, upload_preset: env.CLOUDINARY_UPLOAD_PRESET };
    const body = new FormData();
    body.set("file", file, file.name || `${noteId}.bin`);
    body.set("api_key", env.CLOUDINARY_API_KEY);
    body.set("timestamp", String(timestamp));
    body.set("folder", folder);
    body.set("public_id", publicId);
    body.set("upload_preset", env.CLOUDINARY_UPLOAD_PRESET);
    body.set("signature", await signParams(params, env.CLOUDINARY_API_SECRET));

    const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
      method: "POST",
      body,
    });
    if (!response.ok) return json(502, { error: "File upload failed. Please try again." });
    const result = await response.json();
    return json(200, {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type || resourceType,
      bytes: result.bytes,
      format: result.format,
    });
  } catch {
    return json(400, { error: "Could not upload this file." });
  }
}

export async function deleteCloudinaryFile(request, env, user) {
  try {
    requireConfig(env);
    const { publicId, resourceType = "raw" } = await request.json();
    const folder = `notes/${user.sub}/`;
    if (typeof publicId !== "string" || !publicId.startsWith(folder)) return json(403, { error: "You cannot delete this file." });
    if (!new Set(["image", "raw", "video"]).has(resourceType)) return json(400, { error: "Invalid file type." });

    const timestamp = Math.floor(Date.now() / 1000);
    const params = { invalidate: "true", public_id: publicId, timestamp, type: "upload" };
    const body = new URLSearchParams({
      api_key: env.CLOUDINARY_API_KEY,
      timestamp: String(timestamp),
      type: "upload",
      invalidate: "true",
      public_id: publicId,
      signature: await signParams(params, env.CLOUDINARY_API_SECRET),
    });
    const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) return json(502, { error: "File deletion failed." });
    return json(200, { ok: true });
  } catch {
    return json(400, { error: "Could not delete this file." });
  }
}
