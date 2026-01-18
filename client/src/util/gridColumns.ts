/**
 * Calculate optimal grid columns to avoid ugly orphan rows.
 * 
 * Rules:
 * - 2+1 is always fine (special case)
 * - Otherwise, the last row must have MORE than half the items of a full row
 * - If not, reduce columns until the rule is satisfied
 * 
 * Examples:
 * - 4 items, max 3 → 2 cols (2+2 instead of 3+1)
 * - 5 items, max 3 → 3 cols (3+2 is fine, 2 > 1.5)
 * - 7 items, max 4 → 4 cols (4+3 is fine, 3 > 2)
 * - 3 items, max 2 → 2 cols (2+1 is fine, special case)
 */
export function getOptimalColumns(itemCount: number, maxCols: number): number {
  // Edge cases
  if (itemCount <= 0) return 1;
  if (maxCols <= 1) return 1;
  
  // If all items fit in one row, use that many columns
  if (itemCount <= maxCols) return itemCount;
  
  // Try each column count from maxCols down to 2
  for (let cols = maxCols; cols >= 2; cols--) {
    const remainder = itemCount % cols;
    
    // No orphan row - perfect fit
    if (remainder === 0) return cols;
    
    // Special case: 2+1 is always acceptable
    if (cols === 2 && remainder === 1) return cols;
    
    // Check if remainder is more than half
    if (remainder > cols / 2) return cols;
  }
  
  // Fallback to 2 columns
  return 2;
}

/**
 * Get CSS grid-template-columns value for optimal layout
 */
export function getGridTemplateColumns(
  itemCount: number,
  maxCols: number,
  minWidth: string = '260px',
  maxWidth: string = '1fr'
): string {
  const cols = getOptimalColumns(itemCount, maxCols);
  return `repeat(${cols}, minmax(${minWidth}, ${maxWidth}))`;
}
