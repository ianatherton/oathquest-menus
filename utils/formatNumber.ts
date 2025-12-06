export function formatNumber(num: number): string {
  // Handle numbers up to 12 digits (trillion)
  if (num < 1000000000000) {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toLocaleString();
  }

  // For numbers >= 1 trillion, use letter notation (a-z)
  // a = 10^12 (trillion)
  // b = 10^15 (quadrillion)
  // c = 10^18 (quintillion)
  // etc.
  
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let exponent = 12; // Start at trillion (10^12)
  let letterIndex = 0;

  while (letterIndex < letters.length) {
    const divisor = Math.pow(10, exponent);
    const nextDivisor = Math.pow(10, exponent + 3);
    
    if (num < nextDivisor) {
      return `${(num / divisor).toFixed(2)}${letters[letterIndex]}`;
    }
    
    exponent += 3;
    letterIndex++;
  }

  // If we exceed z, just show with z
  return `${(num / Math.pow(10, 12 + 25 * 3)).toFixed(2)}z`;
}
