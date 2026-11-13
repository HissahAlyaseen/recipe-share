
import { useEffect, useState } from 'react'
import './RatingsReviews.css'

function RatingsReviews({ recipeId }) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewError, setReviewError] = useState('')

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(`recipe-reviews-${recipeId}`)
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editText, setEditText] = useState('')
  const [editError, setEditError] = useState('')

  // Load the reviews belonging to the selected recipe.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`recipe-reviews-${recipeId}`)
      const parsed = saved ? JSON.parse(saved) : []
      setReviews(Array.isArray(parsed) ? parsed : [])
    } catch {
      setReviews([])
    }

    setEditingReviewId(null)
    setEditError('')
    setRating(0)
    setReviewText('')
    setReviewError('')
  }, [recipeId])

  const saveReviews = (updatedReviews) => {
    try {
      localStorage.setItem(
        `recipe-reviews-${recipeId}`,
        JSON.stringify(updatedReviews)
      )

      setReviews(updatedReviews)
      return true
    } catch {
      return false
    }
  }

  // Add a new review.
  const averageRating = reviews.length > 0
  ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  : 0
  const handleSubmitReview = () => {
    setReviewError('')

    if (rating === 0) {
      setReviewError('Please select a rating.')
      return
    }

    if (!reviewText.trim()) {
      setReviewError('Please write your review.')
      return
    }

    const newReview = {
      id: crypto.randomUUID(),
      recipeId,
      rating,
      text: reviewText.trim(),
      createdAt: new Date().toISOString()
    }

    const updatedReviews = [...reviews, newReview]

    if (!saveReviews(updatedReviews)) {
      setReviewError('Could not save your review. Please try again.')
      return
    }

    setRating(0)
    setReviewText('')
  }

  // Open inline editing for the selected review.
  const handleEditReview = (review) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditText(review.text)
    setEditError('')
  }

  // Cancel editing without changing the saved review.
  const handleCancelEdit = () => {
    setEditingReviewId(null)
    setEditRating(0)
    setEditText('')
    setEditError('')
  }

  // Save changes to an existing review.
  const handleSaveEdit = () => {
    setEditError('')

    if (editRating === 0) {
      setEditError('Please select a rating.')
      return
    }

    if (!editText.trim()) {
      setEditError('Please write your review.')
      return
    }

    const updatedReviews = reviews.map((review) =>
      review.id === editingReviewId
        ? {
            ...review,
            rating: editRating,
            text: editText.trim(),
            updatedAt: new Date().toISOString()
          }
        : review
    )

    if (!saveReviews(updatedReviews)) {
      setEditError('Could not update your review. Please try again.')
      return
    }

    handleCancelEdit()
  }

  return (
    <section className="ratings-reviews">
      <h2>Ratings & Reviews</h2>
      <p>Share your experience with this recipe.</p>

      {/* Add a new review */}
      <div className="rating-section">
        <h3>Rate this recipe</h3>

        <div
          className="rating-stars"
          role="group"
          aria-label="Recipe rating"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={star <= rating ? 'star selected' : 'star'}
              onClick={() =>
                setRating((previous) => previous === star ? 0 : star)
              }
              aria-label={`Rate ${star} out of 5`}
              aria-pressed={rating === star}
            >
              {star <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>

        <p>
          {rating > 0
            ? `You selected ${rating} out of 5 stars`
            : 'Select a rating'}
        </p>
      </div>

      <div className="review-section">
        <label htmlFor="review-text">Write your review</label>

        <textarea
          id="review-text"
          placeholder="What did you think of this recipe?"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
        />

        {reviewError && (
          <p className="review-error" role="alert">
            {reviewError}
          </p>
        )}

        <button
          type="button"
          className="review-submit"
          onClick={handleSubmitReview}
        >
          Submit Review
        </button>
      </div>

      {/* Display existing reviews */}
      <div className="reviews-list">
        <h3>Community Reviews ({reviews.length})</h3>
        {reviews.length > 0 && (
            <p className="average-rating">
                ★ {averageRating.toFixed(1)} / 5 ({reviews.length} reviews)
            </p>
            )}

        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              {editingReviewId === review.id ? (
                /* Inline edit form */
                <div className="inline-edit">
                  <h4>Edit your review</h4>

                  <div
                    className="rating-stars"
                    role="group"
                    aria-label="Edit recipe rating"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={
                          star <= editRating
                            ? 'star selected'
                            : 'star'
                        }
                        onClick={() =>
                          setEditRating((previous) =>
                            previous === star ? 0 : star
                          )
                        }
                        aria-label={`Rate ${star} out of 5`}
                        aria-pressed={editRating === star}
                      >
                        {star <= editRating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>

                  <label
                    htmlFor={`edit-review-${review.id}`}
                    className="edit-label"
                  >
                    Your review
                  </label>

                  <textarea
                    id={`edit-review-${review.id}`}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                  />

                  {editError && (
                    <p className="review-error" role="alert">
                      {editError}
                    </p>
                  )}

                  <div className="edit-actions">
                    <button
                      type="button"
                      className="review-cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="review-save-btn"
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal review display */
                <>
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>

                  <p className="review-text">{review.text}</p>

                  <div className="review-footer">
                    <small>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>

                    <button
                      type="button"
                      className="review-edit-btn"
                      onClick={() => handleEditReview(review)}
                    >
                      Edit Review
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default RatingsReviews
