
const REVIEWS_KEY = 'recipe_share_reviews'

export const REVIEWS_UPDATED_EVENT = 'recipe-share-reviews-updated'

// Convert old review formats into one shared format.
function normalizeReview(review) {
  return {
    ...review,
    id: String(review.id),
    recipeId: review.recipeId,
    userName: review.userName || 'Community member',
    rating: Number(review.rating) || 0,
    comment: review.comment ?? review.text ?? '',
    date: review.date || review.createdAt || new Date().toISOString(),
    flagged: Boolean(review.flagged)
  }
}

function readStoredReviews() {
  try {
    const saved = localStorage.getItem(REVIEWS_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.map(normalizeReview) : []
  } catch {
    return []
  }
}

function notifyUpdate() {
  window.dispatchEvent(new Event(REVIEWS_UPDATED_EVENT))
}

export const reviewStorage = {
  // Read all reviews.
  getAll() {
    return readStoredReviews()
  },

  // Read reviews for one recipe.
  getByRecipeId(recipeId) {
    return readStoredReviews().filter(
      (review) => String(review.recipeId) === String(recipeId)
    )
  },

  // Initialize shared storage and migrate older reviews once.
  initialize(defaultReviews = []) {
    const existing = localStorage.getItem(REVIEWS_KEY)

    if (existing !== null) {
      return readStoredReviews()
    }

    const migratedReviews = [...defaultReviews]

    // Migrate reviews previously managed by the Admin page.
    try {
      const oldAdminReviews = JSON.parse(
        localStorage.getItem('rs_admin_reviews_v2') || '[]'
      )

      if (Array.isArray(oldAdminReviews)) {
        migratedReviews.push(...oldAdminReviews)
      }
    } catch {
      // Ignore invalid old data.
    }

    // Migrate reviews previously submitted on individual recipe pages.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)

      if (key && key.startsWith('recipe-reviews-')) {
        try {
          const oldReviews = JSON.parse(localStorage.getItem(key) || '[]')

          if (Array.isArray(oldReviews)) {
            migratedReviews.push(...oldReviews)
          }
        } catch {
          // Ignore invalid old data.
        }
      }
    }

    // Avoid duplicate reviews with the same ID.
    const uniqueReviews = [
      ...new Map(
        migratedReviews.map((review) => {
          const normalized = normalizeReview(review)
          return [normalized.id, normalized]
        })
      ).values()
    ]

    this.replaceAll(uniqueReviews)
    return uniqueReviews
  },

  // Replace the complete shared review list.
  replaceAll(reviews) {
    const normalized = reviews.map(normalizeReview)
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(normalized))
    notifyUpdate()
    return normalized
  },

  // Replace reviews for one recipe without changing other recipes' reviews.
  replaceForRecipe(recipeId, updatedReviews) {
    const otherReviews = this.getAll().filter(
      (review) => String(review.recipeId) !== String(recipeId)
    )

    return this.replaceAll([...otherReviews, ...updatedReviews])
  },

  // Update one review.
  update(reviewId, changes) {
    const updated = this.getAll().map((review) =>
      String(review.id) === String(reviewId)
        ? normalizeReview({ ...review, ...changes })
        : review
    )

    return this.replaceAll(updated)
  },

  // Delete one review.
  delete(reviewId) {
    const updated = this.getAll().filter(
      (review) => String(review.id) !== String(reviewId)
    )

    return this.replaceAll(updated)
  }
}
