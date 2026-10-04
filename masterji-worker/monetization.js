export function eligibility({ notes = 0, likes = 0, averageRating = 0, ratingCount = 0 }) {
  return { notes, likes, averageRating, ratingCount, eligible: notes >= 50 && likes >= 5000 && ratingCount > 0 && averageRating > 3 }
}
