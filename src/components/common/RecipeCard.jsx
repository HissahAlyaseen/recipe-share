import { Link } from 'react-router-dom'
import BookmarkButton from './BookmarkButton'
import './RecipeCard.css'

/**
 * Reusable RecipeCard Component for Recipe Share
 * Compatible with Member 1's discovery / search feeds and Personal Cookbook.
 * Displays photo, title, category, cooking time, servings, author, and integrated BookmarkButton.
 */
export default function RecipeCard({
  recipe,
  onBookmarkToggle = null,
  showAuthor = true,
  className = ''
}) {
  if (!recipe) return null

  return (
    <article className={`recipe-card ${className}`}>
      {/* Image Thumbnail with Overlay Bookmark Button */}
      <div className="recipe-card-media">
        <Link to={`/recipes/${recipe.id}`} className="card-media-link" tabIndex={-1}>
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="card-media-img"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="card-media-placeholder">
              <span className="placeholder-icon">🍲</span>
              <span className="placeholder-text">Recipe photo</span>
            </div>
          )}
        </Link>

        {/* Integrated Floating Bookmark Button */}
        <div className="card-bookmark-overlay">
          <BookmarkButton
            recipeId={recipe.id}
            recipe={recipe}
            variant="icon"
            size="md"
            onToggle={onBookmarkToggle}
            showToast={true}
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="recipe-card-body">
        <div className="card-category-row">
          <span className="card-category">{recipe.category || 'Dinner'}</span>
          {recipe.difficulty && (
            <span className="card-difficulty">· {recipe.difficulty}</span>
          )}
        </div>

        <h3 className="card-title">
          <Link to={`/recipes/${recipe.id}`} className="card-title-link">
            {recipe.title}
          </Link>
        </h3>

        <div className="card-meta-line">
          <span>⏱️ {recipe.cookingTime || 20} min</span>
          <span className="meta-dot">·</span>
          <span>👥 {recipe.servings || 2} servings</span>
        </div>

        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <div className="card-tags-row">
            {recipe.dietaryTags.slice(0, 2).map((tag) => (
              <span key={tag} className="card-diet-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {showAuthor && (
          <div className="card-footer-author">
            By <span className="author-name">{recipe.authorName || 'Home Cook'}</span>
          </div>
        )}
      </div>
    </article>
  )
}

