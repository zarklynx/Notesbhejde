import { createRemoteJWKSet, jwtVerify } from "jose";

const firebaseKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export async function verifyFirebaseToken(token, projectId) {
  if (!token || !projectId) throw new Error("Firebase authentication is not configured.");

  const { payload } = await jwtVerify(token, firebaseKeys, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (typeof payload.sub !== "string" || !payload.sub) throw new Error("Firebase token has no user.");
  return payload;
}
