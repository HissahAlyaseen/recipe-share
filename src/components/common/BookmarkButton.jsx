import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { bookmarkStorage } from '../../services/bookmarkStorage'
import { recipeStorage } from '../../services/recipeStorage'
import Toast from './Toast'
import './BookmarkButton.css'

/**
 * Reusable BookmarkButton Component
 *
 * Requirements met:
 * 1. Allows saving/bookmarking any recipe.
 * 2. Allows removing previously saved recipes.
 * 3. Displays filled bookmark icon when saved.
 * 4. Displays outlined bookmark icon when not saved.
 * 5. Updates icon immediately on toggle.
 * 6. Displays success message on save.
 * 7. Displays notification on remove.
 * 8. Persists to user's Personal Cookbook and preserves status after refresh.
 * 9. Prevents duplicate bookmarks.
 *
 * Props:
 * - recipeId (number | string): ID of the recipe to bookmark.
 * - recipe (object, optional): recipe object if already loaded.
 * - showLabel (boolean): whether to display text ("Save recipe" / "Saved").
 * - variant ('icon' | 'button' | 'pill'): visual style.
 * - size ('sm' | 'md' | 'lg'): icon & button sizing.
 * - onToggle (function, optional): callback(isSaved, bookmark).
 * - showToast (boolean): whether to show built-in toast notification.
 * - className (string): extra custom CSS classes.
 */
export default function BookmarkButton({
  recipeId,
  recipe = null,
  showLabel = false,
  variant = 'icon',
  size = 'md',
  onToggle = null,
  showToast = true,
  className = ''
}) {
  const { user } = useAuth()
  const userId = user?.id || 'user-1'
  const numericId = Number(recipeId)

  // Initialize bookmark status synchronously from localStorage
  const [isSaved, setIsSaved] = useState(() => {
    return bookmarkStorage.isBookmarked(userId, numericId)
  })
  const [prevKey, setPrevKey] = useState(`${userId}_${numericId}`)
  const [toast, setToast] = useState(null)

  // Synchronize state when recipeId or user changes without cascading effect renders
  if (prevKey !== `${userId}_${numericId}`) {
    setPrevKey(`${userId}_${numericId}`)
    setIsSaved(bookmarkStorage.isBookmarked(userId, numericId))
  }

  const handleToggle = (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent triggering card links

    try {
      const result = bookmarkStorage.toggleBookmark(userId, numericId)
      setIsSaved(result.isBookmarked)

      // Notify parent callback if provided
      if (typeof onToggle === 'function') {
        onToggle(result.isBookmarked, result.bookmark)
      }

      // Display notification message
      if (showToast) {
        setToast({
          type: 'success',
          message: result.message
        })
      }
    } catch (err) {
      if (showToast) {
        setToast({
          type: 'error',
          message: err.message || 'Failed to update bookmark.'
        })
      }
    }
  }

  // Get recipe title for accessibility label
  const recipeTitle = recipe?.title || recipeStorage.getById(numericId)?.title || 'recipe'
  const actionLabel = isSaved ? 'Remove from saved recipes' : 'Save recipe to cookbook'

  // Icon sizing in pixels
  const iconPixelSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18

  return (
    <>
      <button
        type="button"
        className={`bookmark-btn variant-${variant} size-${size} ${isSaved ? 'is-bookmarked' : ''} ${className}`}
        onClick={handleToggle}
        title={actionLabel}
        aria-label={`${actionLabel} - ${recipeTitle}`}
        aria-pressed={isSaved}
      >
        <span className="bookmark-icon-wrapper" aria-hidden="true">
          {isSaved ? (
            /* Filled Bookmark Icon */
            <svg
              className="bookmark-svg filled"
              viewBox="0 0 24 24"
              width={iconPixelSize}
              height={iconPixelSize}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          ) : (
            /* Outlined Bookmark Icon */
            <svg
              className="bookmark-svg outlined"
              viewBox="0 0 24 24"
              width={iconPixelSize}
              height={iconPixelSize}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </span>

        {showLabel && (
          <span className="bookmark-text-label">
            {isSaved ? 'Saved in Cookbook' : 'Save to Cookbook'}
          </span>
        )}
      </button>

      {/* Internal Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </>
  )
}
