import { customAlphabet } from "nanoid/non-secure";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const makeId = customAlphabet(alphabet, 6); // 6-char default

export function generateCode(len = 6) {
  const maker = customAlphabet(alphabet, len);
  return maker();
}

export function isValidShortcode(code) {
  return typeof code === "string" && /^[0-9a-zA-Z]{4,12}$/.test(code);
}

export { makeId }; 
