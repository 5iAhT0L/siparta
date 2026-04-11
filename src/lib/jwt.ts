import { SignJWT, jwtVerify } from "jose";

export type AccessPayload = {
  sub: string;
  role: string;
  rtId: string | null;
  rwId: string | null;
  rumahId: string | null;
};

function secretKey(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET harus diset (min 16 karakter)");
  }
  return new TextEncoder().encode(s);
}

export async function signAccessToken(payload: AccessPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey());
}

export async function verifyAccessToken(token: string): Promise<AccessPayload> {
  const { payload } = await jwtVerify(token, secretKey());
  return {
    sub: String(payload.sub),
    role: String(payload.role),
    rtId: payload.rtId != null ? String(payload.rtId) : null,
    rwId: payload.rwId != null ? String(payload.rwId) : null,
    rumahId: payload.rumahId != null ? String(payload.rumahId) : null,
  };
}
