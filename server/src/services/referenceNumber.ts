import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O/1/I) for reference numbers a human may need
// to read over the phone or retype from an email.
const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

export function generateInspectionRequestReference(): string {
  return `DCB-INS-${nanoid()}`;
}

export function generateProjectReference(): string {
  return `DCB-PRJ-${nanoid()}`;
}
