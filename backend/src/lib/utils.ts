export const getTimestamp = () =>
  `[${new Date().toISOString().replace("T", ", ").replace("Z", "")}]`;

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return sum / numbers.length;
}