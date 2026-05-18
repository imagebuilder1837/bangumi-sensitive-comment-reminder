const fs = require('node:fs/promises');
const path = require('node:path');
const { webcrypto } = require('node:crypto');

const crypto = webcrypto;

const PASSPHRASE =
  process.argv[2] || 'bangumi-sensitive-comment-reminder';

const WORDS_PATH = path.resolve(__dirname, '../res/sensitive-words.json');

async function main() {
  const words = JSON.parse(await fs.readFile(WORDS_PATH, 'utf8'));
  const encrypted = await encryptWords(words, PASSPHRASE);

  console.log(encrypted);
}

async function encryptWords(words, passphrase) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase);

  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(words))
  );

  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(cipher))}`;
}

async function deriveKey(passphrase) {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(passphrase)
  );

  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

main();
