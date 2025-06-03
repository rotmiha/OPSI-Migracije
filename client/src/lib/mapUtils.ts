// Define discrete color scale for the default palette (blue shades)
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
 * Get a color from the color scale or gradient based on a value and the min/max range.
 * Supports two palettes: "default" (discrete blue scale) and "red" (smooth red gradient).
 */
export function getColorForValue(
  value: number, 
  min: number, 
  max: number, 
  palette: "default" | "red" = "default"
): string {
  // Handle edge case where min == max
  if (min === max) {
    if (palette === "red") {
      return `rgba(255, 200, 200, 1)`; // light red
    }
    return colors[Math.floor(colors.length / 2)]; // middle blue
  }

  // Normalize and clamp value between 0 and 1
  const ratio = (value - min) / (max - min);
  const clamp = Math.max(0, Math.min(1, ratio));

  if (palette === "red") {
    // Smooth red gradient from light pink to bright red
    return `rgba(255, ${Math.round(200 - 150 * clamp)}, ${Math.round(200 - 150 * clamp)}, 1)`;
  }

  // Default palette: discrete blue scale
  const index = Math.floor(clamp * (colors.length - 1));
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
