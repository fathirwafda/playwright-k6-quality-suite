export const sortedStrings = (values: readonly string[], dir: 'asc' | 'desc' = 'asc'): string[] => {
  const copy = [...values].sort((a, b) => a.localeCompare(b));
  return dir === 'asc' ? copy : copy.reverse();
};

export const sortedNumbers = (values: readonly number[], dir: 'asc' | 'desc' = 'asc'): number[] =>
  [...values].sort((a, b) => (dir === 'asc' ? a - b : b - a));
