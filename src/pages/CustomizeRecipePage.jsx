import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recipeStorage } from '../services/recipeStorage'
import { cookbookStorage } from '../services/cookbookStorage'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import Toast from '../components/common/Toast'
import './CustomizeRecipePage.css'

export default function CustomizeRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id || 'user-1'

  const recipe = useMemo(() => recipeStorage.getById(id), [id])
  const collections = useMemo(() => cookbookStorage.getUserCollections(userId), [userId])
  const existingCustomization = useMemo(() => cookbookStorage.getCustomization(userId, id), [userId, id])

  // Form states
  const [selectedIngredient, setSelectedIngredient] = useState(() => {
    if (existingCustomization?.ingredientReplaced) {
      return existingCustomization.ingredientReplaced
    }
    return recipe?.ingredients?.[0] || ''
  })

  const [replacement, setReplacement] = useState(() => {
    return existingCustomization?.replacementIngredient || ''
  })

  const [additionalNotes, setAdditionalNotes] = useState(() => {
    return existingCustomization?.personalNotes || ''
  })

  const [selectedCollectionId, setSelectedCollectionId] = useState(() => {
    if (existingCustomization?.collectionId) {
      return existingCustomization.collectionId
    }
    return collections.length > 0 ? collections[0].id : ''
  })

  // State to show the Figma "Customized recipe saved" confirmation view
  const [savedSuccessData, setSavedSuccessData] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  if (!recipe) {
    return (
      <div className="customize-page-wrapper">
        <Header />
        <main className="customize-main">
          <div className="customize-container">
            <h1 className="page-title">Recipe Not Found</h1>
            <p className="page-subtitle">The recipe you are trying to customize does not exist.</p>
            <Link to="/cookbook" className="btn-find-more-white" style={{ marginTop: '20px' }}>
              Back to cookbook
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  const handleReset = () => {
    setSelectedIngredient(recipe.ingredients?.[0] || '')
    setReplacement('')
    setAdditionalNotes('')
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!replacement.trim()) {
      setError('Please provide a replacement ingredient (e.g. "50 g dairy-free feta").')
      return
    }

    const chosenCol = collections.find((c) => String(c.id) === String(selectedCollectionId))

    const customizationData = {
      originalTitle: recipe.title,
      customTitle: `${recipe.title} · My version`,
      ingredientReplaced: selectedIngredient,
      replacementIngredient: replacement.trim(),
      personalNotes: additionalNotes.trim(),
      collectionId: selectedCollectionId || null,
      collectionName: chosenCol ? chosenCol.name : 'Cookbook',
      allergenNotes: `Original contains ingredients that were substituted. Replacement: ${replacement.trim()}`
    }

    try {
      cookbookStorage.saveCustomization(userId, recipe.id, customizationData)
      setSavedSuccessData({
        recipeTitle: recipe.title,
        originalIngredient: selectedIngredient,
        replacementIngredient: replacement.trim(),
        collectionName: chosenCol ? chosenCol.name : 'your cookbook',
        authorName: recipe.authorName || 'Home Cook'
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Failed to save customized recipe.')
    }
  }

  // CONFIRMATION VIEW (Matching Figma 'customized recipe saved.jpg')
  if (savedSuccessData) {
    return (
      <div className="customize-page-wrapper">
        <Header />
        <main className="customize-main">
          <div className="customize-container">
            <div className="customized-saved-card">
              <h1 className="page-title">Customized recipe saved</h1>

              {/* Success Alert Banner matching Figma */}
              <div className="saved-alert-banner">
                <p className="alert-banner-title">✓ Customized copy saved</p>
                <p className="alert-banner-desc">
                  Your private version was added to {savedSuccessData.collectionName}.{' '}
                  {savedSuccessData.authorName}&apos;s original is unchanged.
                </p>
              </div>

              {/* Recipe Headline */}
              <h2 className="customized-headline">
                {savedSuccessData.recipeTitle} · My version
              </h2>

              <p className="replacement-summary-line">
                Ingredient replaced: <strong>{savedSuccessData.originalIngredient}</strong> →{' '}
                <strong>{savedSuccessData.replacementIngredient}</strong>
              </p>

              {/* Allergen Callout Box matching Figma */}
              <div className="allergen-callout-box">
                <h3 className="allergen-callout-heading">Check the replacement label</h3>
                <p className="allergen-callout-body">
                  Allergen information changes with substitutions. Filters and substitutions do not
                  guarantee allergy safety. Check every ingredient, product label and cross-contact
                  risk before cooking.
                </p>
              </div>

              {/* Actions matching Figma */}
              <div className="saved-view-actions">
                <button
                  type="button"
                  className="btn-modal-primary"
                  onClick={() => navigate(`/recipes/${recipe.id}?customized=true`)}
                >
                  View customized recipe
                </button>
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => navigate('/cookbook')}
                >
                  Back to cookbook
                </button>
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // MAIN FORM VIEW (Matching Figma 'my cookbooks, customize recipe.jpg')
  return (
    <div className="customize-page-wrapper">
      <Header />

      <main className="customize-main">
        <div className="customize-container">
          {/* Top navigation */}
          <div className="top-nav-link-row">
            <button
              type="button"
              className="back-link-btn"
              onClick={() => navigate(-1)}
            >
              ‹ Cancel · Back to saved recipe
            </button>
          </div>

          <header className="page-heading-block">
            <h1 className="page-title">Customize recipe</h1>
            <h2 className="recipe-sub-title">{recipe.title}</h2>
            <p className="page-subtitle">
              Original by {recipe.authorName || 'Home Cook'} · {recipe.cookingTime || 25} min ·{' '}
              {recipe.servings || 2} servings
            </p>
          </header>

          {/* Your private version callout matching Figma */}
          <div className="private-version-callout">
            <h3 className="private-callout-title">Your private version</h3>
            <p className="private-callout-desc">
              Save changes as a separate copy in your cookbook.{' '}
              {recipe.authorName || 'The author'}&apos;s original recipe stays unchanged.
            </p>
          </div>

          {/* Original Ingredients List */}
          <section className="ingredients-preview-section">
            <h3 className="section-title">
              Ingredients · {recipe.servings || 2} servings
            </h3>
            <ul className="original-ingredients-list">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="ing-item">
                    {ing}
                  </li>
                ))
              ) : (
                <li className="ing-item muted">No ingredients listed.</li>
              )}
            </ul>
          </section>

          {/* Customization Form */}
          <form onSubmit={handleSubmit} className="customize-form" noValidate>
            {/* Ingredient to replace */}
            <div className="form-group">
              <label htmlFor="replace-ingredient-select" className="form-label">
                Ingredient to replace
              </label>
              <select
                id="replace-ingredient-select"
                className="form-select"
                value={selectedIngredient}
                onChange={(e) => setSelectedIngredient(e.target.value)}
              >
                {recipe.ingredients?.map((ing, idx) => (
                  <option key={idx} value={ing}>
                    {ing}
                  </option>
                ))}
              </select>
            </div>

            {/* Replacement ingredient */}
            <div className="form-group">
              <label htmlFor="replacement-input" className="form-label">
                Replacement ingredient
              </label>
              <input
                id="replacement-input"
                type="text"
                className={`form-input ${error ? 'input-error' : ''}`}
                placeholder="e.g. 50 g dairy-free feta"
                value={replacement}
                onChange={(e) => {
                  setReplacement(e.target.value)
                  if (error) setError('')
                }}
              />
              <p className="field-hint">Suggested swap. Check its label for allergens.</p>
              {error && <p className="field-error">{error}</p>}
            </div>

            {/* Actions: reset swap */}
            <div className="swap-actions-row">
              <button
                type="button"
                className="btn-reset-swap"
                onClick={handleReset}
              >
                Reset swap
              </button>
            </div>

            {/* Allergen information changes warning box matching Figma */}
            <div className="allergen-warning-box">
              <h4 className="allergen-warning-title">Allergen information changes</h4>
              <p className="allergen-warning-desc">
                Original may contain allergens. Replacement ingredients might contain soy, nuts or
                other allergens. Filters and substitutions do not guarantee allergy safety. Check
                every ingredient, product label and cross-contact risk before cooking.
              </p>
            </div>

            {/* Save to cookbook collection selector */}
            <div className="form-group">
              <label htmlFor="save-to-cookbook-select" className="form-label">
                Save to cookbook
              </label>
              <select
                id="save-to-cookbook-select"
                className="form-select"
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.recipeIds?.length || 0} recipes)
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button type="submit" className="btn-save-customized-primary">
              Save customized copy
            </button>
          </form>
        </div>
      </main>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}

