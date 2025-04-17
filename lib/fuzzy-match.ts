/**
 * Performs fuzzy matching between a query string and a target string
 * @param text The target text to search in
 * @param query The query to search for
 * @returns A score between 0 and 100 indicating the match quality
 */
export function fuzzyMatch(text: string, query: string): number {
  if (!query) return 0
  if (!text) return 0

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  // Exact match gets highest score
  if (lowerText === lowerQuery) return 100

  // Starts with gets high score
  if (lowerText.startsWith(lowerQuery)) return 80

  // Contains gets medium score
  if (lowerText.includes(lowerQuery)) return 60

  // Fuzzy match - count matching characters in order
  let textIndex = 0
  let queryIndex = 0
  let matchCount = 0

  while (textIndex < lowerText.length && queryIndex < lowerQuery.length) {
    if (lowerText[textIndex] === lowerQuery[queryIndex]) {
      matchCount++
      queryIndex++
    }
    textIndex++
  }

  // If we matched all query characters, calculate a score based on how many extra characters we needed
  if (queryIndex === lowerQuery.length) {
    const directness = lowerQuery.length / textIndex
    return Math.round(directness * 40)
  }

  return 0
}
