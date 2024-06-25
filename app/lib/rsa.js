// app/lib/rsa.js

// Generate a random prime number
export function generatePrime(min, max) {
  const sieve = Array(max + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i <= Math.sqrt(max); i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= max; j += i) {
        sieve[j] = false;
      }
    }
  }
  const primes = [];
  for (let i = min; i <= max; i++) {
    if (sieve[i]) primes.push(i);
  }
  return primes[Math.floor(Math.random() * primes.length)];
}

// Calculate GCD
export function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// Calculate modular exponentiation
export function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;
  let result = 1;
  base = base % modulus;
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }
  return result;
}

// Generate RSA keys
export function generateRSAKeys() {
  const p = generatePrime(100, 1000);
  const q = generatePrime(100, 1000);
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 65537; // Commonly used value for e
  while (gcd(e, phi) !== 1) {
    e++;
  }
  let d = 1;
  while ((d * e) % phi !== 1) {
    d++;
  }

  return { publicKey: { e, n }, privateKey: { d, n } };
}

// RSA Encryption
export function rsaEncrypt(message, publicKey) {
  return message
    .split("")
    .map((char) => modPow(char.charCodeAt(0), publicKey.e, publicKey.n));
}

// RSA Decryption
export function rsaDecrypt(encryptedMessage, privateKey) {
  return encryptedMessage
    .map((char) =>
      String.fromCharCode(modPow(char, privateKey.d, privateKey.n))
    )
    .join("");
}

// Store keys and registration timestamp in localStorage
export function storeKeys(userId, publicKey, privateKey) {
  const registrationTimestamp = Date.now();
  const keysData = JSON.stringify({
    publicKey,
    privateKey,
    registrationTimestamp,
  });
  localStorage.setItem(`rsaKeys_${userId}`, keysData);
  return registrationTimestamp;
}

// Retrieve keys and registration timestamp from localStorage
export function getKeys(userId) {
  const keysData = localStorage.getItem(`rsaKeys_${userId}`);
  return keysData ? JSON.parse(keysData) : null;
}

// Clear all user data from localStorage
export function clearAllUserData(userId) {
  localStorage.removeItem(`rsaKeys_${userId}`);
}

// Generate or retrieve RSA keys
export function getOrGenerateRSAKeys(userId) {
  const storedKeys = getKeys(userId);

  if (
    storedKeys &&
    storedKeys.publicKey &&
    storedKeys.privateKey &&
    storedKeys.registrationTimestamp
  ) {
    return storedKeys;
  } else {
    // Generate new keys
    const keys = generateRSAKeys();
    const registrationTimestamp = storeKeys(
      userId,
      keys.publicKey,
      keys.privateKey
    );
    return { ...keys, registrationTimestamp };
  }
}
