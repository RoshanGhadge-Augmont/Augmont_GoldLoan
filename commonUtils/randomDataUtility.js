export function generateRandomMobileNumber() {
  const firstDigit = [7, 8, 9][Math.floor(Math.random() * 3)];
  let remainingDigits = "";

  for (let i = 0; i < 9; i++) {
    remainingDigits += Math.floor(Math.random() * 10);
  }

  return `${firstDigit}${remainingDigits}`;
}

export function generateRandomPAN() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let pan = "";

  // First 5 letters
  for (let i = 0; i < 5; i++) {
    pan += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Next 4 digits
  for (let i = 0; i < 4; i++) {
    pan += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Last letter
  pan += letters.charAt(Math.floor(Math.random() * letters.length));

  return pan;
}

export function generateRandomAadharNumber() {
  let aadhar = Math.floor(2 + Math.random() * 8).toString(); // first digit 2–9

  for (let i = 1; i < 12; i++) {
    aadhar += Math.floor(Math.random() * 10);
  }

  return aadhar;
}

export function generateRandomVoterIdNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let voterId = "";

  for (let i = 0; i < 3; i++) {
    voterId += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 7; i++) {
    voterId += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return voterId;
}

export function generateTransactionId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const randomChars = Array.from({ length: 4 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  );

  const randomNums = Array.from({ length: 3 }, () =>
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
  );

  return [...randomChars, ...randomNums]
    .sort(() => Math.random() - 0.5)
    .join("");
}
