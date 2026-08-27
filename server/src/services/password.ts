import argon2 from "argon2";

// Argon2id per spec Section 14. Parameters follow OWASP's current baseline
// recommendation for interactive login (tune memoryCost down only if the
// deployment target is memory-constrained).
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    // Malformed hash or verification error — treat as invalid credentials,
    // never throw into the caller (which would leak timing/shape info).
    return false;
  }
}
