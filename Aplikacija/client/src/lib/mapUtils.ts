// Define color scale for the map
const colors = [
  "#e6f2ff",  // lightest blue
  "#cce5ff",
  "#99cbff",
  "#66b0ff",
  "#3395ff",
  "#0078d4",
  "#005a9e",
  "#004578",
  "#002b49"   // darkest blue
];

/**
 * Get a color from the color scale based on a value and the min/max range
 */
export function getColorForValue(value: number, min: number, max: number): string {
  // If min and max are the same, return a middle color
  if (min === max) return colors[Math.floor(colors.length / 2)];
  
  // Calculate the normalized position in the range (0 to 1)
  const normalized = (value - min) / (max - min);
  
  // Get the corresponding color index
  const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
  
  return colors[index];
}

/**
 * Calculate statistics from an array of values
 */
export function calculateStatistics(values: number[]): { min: number, max: number, avg: number, median: number } {
  // Sort values for min, max, and median
  const sortedValues = [...values].sort((a, b) => a - b);
  
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  
  // Calculate average
  const sum = sortedValues.reduce((acc, val) => acc + val, 0);
  const avg = sum / sortedValues.length;
  
  // Calculate median
  const midIndex = Math.floor(sortedValues.length / 2);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
    : sortedValues[midIndex];
  
  return { min, max, avg, median };
}
