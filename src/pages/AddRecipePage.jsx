import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recipeStorage } from '../services/recipeStorage'
import RecipePreviewModal from '../components/recipes/RecipePreviewModal'
import Toast from '../components/common/Toast'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import './AddRecipePage.css'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Beverage']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const AVAILABLE_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Low-carb',
  'Nut-free',
  'Halal',
  'Keto',
  'High-Protein'
]

export default function AddRecipePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Dinner')
  const [cuisine, setCuisine] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookingTime, setCookingTime] = useState('')
  const [servings, setServings] = useState('2')
  const [difficulty, setDifficulty] = useState('Easy')
  const [image, setImage] = useState('')
  const [imageInputMode, setImageInputMode] = useState('upload') // 'upload' | 'url'

  // Dynamic Ingredients: Starts with exactly one empty ingredient row
  const [ingredientItems, setIngredientItems] = useState([
    { id: 'ing-1', quantity: '', unit: '', name: '' }
  ])

  // Dynamic Preparation Steps: Starts with exactly one empty step
  const [instructions, setInstructions] = useState([''])

  // Dietary Tags: string[]
  const [selectedTags, setSelectedTags] = useState([])
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)

  // Validation & UI State
  const [errors, setErrors] = useState({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [toast, setToast] = useState(null)

  // --- Handlers: Ingredients ---
  const handleAddIngredient = () => {
    setIngredientItems((prev) => [
      ...prev,
      { id: `ing-${Date.now()}-${Math.random()}`, quantity: '', unit: '', name: '' }
    ])
  }

  const handleRemoveIngredient = (index) => {
    if (ingredientItems.length <= 1) {
      setIngredientItems([{ id: `ing-${Date.now()}`, quantity: '', unit: '', name: '' }])
      return
    }
    setIngredientItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleIngredientChange = (index, field, value) => {
    setIngredientItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
    if (errors.ingredients) {
      setErrors((prev) => ({ ...prev, ingredients: null }))
    }
  }

  // --- Handlers: Instructions ---
  const handleAddInstruction = () => {
    setInstructions((prev) => [...prev, ''])
  }

  const handleRemoveInstruction = (index) => {
    if (instructions.length <= 1) {
      setInstructions([''])
      return
    }
    setInstructions((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleInstructionChange = (index, value) => {
    setInstructions((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
    if (errors.instructions) {
      setErrors((prev) => ({ ...prev, instructions: null }))
    }
  }

  // --- Handlers: Dietary Tags ---
  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // --- Handlers: Image Upload ---
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid JPG or PNG image file.' }))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size exceeds 2 MB limit.' }))
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      setImage(uploadEvent.target?.result || '')
      setErrors((prev) => ({ ...prev, image: null }))
    }
    reader.readAsDataURL(file)
  }

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = 'Recipe title is required.'
    } else if (title.trim().length < 3) {
      newErrors.title = 'Recipe title must be at least 3 characters long.'
    }

    const prep = Number(prepTime)
    if (isNaN(prep) || prep < 0) {
      newErrors.prepTime = 'Preparation time must be 0 or greater.'
    }

    const cook = Number(cookingTime)
    if (isNaN(cook) || cook <= 0) {
      newErrors.cookingTime = 'Cooking time must be at least 1 minute.'
    }

    const serv = Number(servings)
    if (isNaN(serv) || serv <= 0) {
      newErrors.servings = 'Servings must be at least 1.'
    }

    const validIngredients = ingredientItems.filter((item) => item.name.trim().length > 0)
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Please add at least one ingredient with a name.'
    }

    const validSteps = instructions.filter((step) => step.trim().length > 0)
    if (validSteps.length === 0) {
      newErrors.instructions = 'Please add at least one preparation step.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Format ingredients array for compatibility
  const buildFormattedIngredients = () => {
    return ingredientItems
      .filter((item) => item.name.trim().length > 0)
      .map((item) => {
        const parts = []
        if (item.quantity.trim()) parts.push(item.quantity.trim())
        if (item.unit.trim()) parts.push(item.unit.trim())
        parts.push(item.name.trim())
        return parts.join(' ')
      })
  }

  const buildRecipePayload = () => {
    const formattedIngredients = buildFormattedIngredients()
    const cleanedSteps = instructions.filter((s) => s.trim().length > 0)

    const fallbackImage =
      image ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'

    return {
      title: title.trim(),
      description: description.trim(),
      category,
      cuisine: cuisine.trim(),
      prepTime: Number(prepTime) || 0,
      cookingTime: Number(cookingTime) || 1,
      servings: Number(servings) || 2,
      difficulty,
      image: fallbackImage,
      ingredients: formattedIngredients,
      ingredientItems,
      instructions: cleanedSteps,
      dietaryTags: selectedTags,
      status: 'Published'
    }
  }

  // --- Handlers: Publish ---
  const handlePublish = async () => {
    if (!validateForm()) {
      setToast({
        type: 'error',
        message: 'Please complete all required fields highlighted in red.'
      })
      return
    }

    setIsPublishing(true)

    try {
      const payload = buildRecipePayload()
      const newRecipe = recipeStorage.create(user.id, user.name, payload)

      setIsPreviewOpen(false)
      setToast({
        type: 'success',
        message: `Recipe "${newRecipe.title}" published successfully!`
      })

      // Short pause to show the success message before redirecting to My Recipes
      setTimeout(() => {
        navigate('/my-recipes', { state: { newlyCreatedId: newRecipe.id } })
      }, 1200)
    } catch (err) {
      console.error('Failed to create recipe:', err)
      setToast({
        type: 'error',
        message: err.message || 'Failed to publish recipe. Please try again.'
      })
      setIsPublishing(false)
    }
  }

  const handleOpenPreview = () => {
    if (!validateForm()) {
      setToast({
        type: 'error',
        message: 'Please fix the validation errors before previewing.'
      })
      return
    }
    setIsPreviewOpen(true)
  }

  const totalTimeMinutes = (Number(prepTime) || 0) + (Number(cookingTime) || 0)

  return (
    <div className="add-recipe-page-wrapper">
      <Header />

      <main className="add-recipe-main">
        <div className="add-recipe-container">
          {/* Top navigation link matching Figma */}
          <div className="top-nav-link-row">
            <Link to="/my-recipes" className="back-link">
              ‹ Cancel · Back to my recipes
            </Link>
          </div>

          <header className="page-heading-block">
            <h1 className="page-title">Add recipe</h1>
            <p className="page-subtitle">
              Shared by {user?.name || 'Alex'} · <span className="req-star">*</span> Required fields
            </p>
          </header>

          {/* Form */}
          <form
            className="recipe-form"
            onSubmit={(e) => {
              e.preventDefault()
              handlePublish()
            }}
            noValidate
          >
            {/* Title */}
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label htmlFor="recipe-title" className="form-label">
                Recipe title <span className="req-star">*</span>
              </label>
              <input
                id="recipe-title"
                type="text"
                className="form-input"
                placeholder="e.g. Spinach & White Bean Skillet"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((prev) => ({ ...prev, title: null }))
                }}
              />
              {errors.title && <span className="field-error-text">{errors.title}</span>}
            </div>

            {/* Short Description */}
            <div className="form-group">
              <label htmlFor="recipe-desc" className="form-label">
                Short description (optional)
              </label>
              <textarea
                id="recipe-desc"
                className="form-textarea desc-textarea"
                rows="2"
                placeholder="A brief introduction or serving recommendation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Time & Servings Grid */}
            <div className="form-grid-2">
              <div className={`form-group ${errors.cookingTime ? 'has-error' : ''}`}>
                <label htmlFor="recipe-cook-time" className="form-label">
                  Cooking time (min) <span className="req-star">*</span>
                </label>
                <input
                  id="recipe-cook-time"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="20"
                  value={cookingTime}
                  onChange={(e) => {
                    setCookingTime(e.target.value)
                    if (errors.cookingTime) setErrors((prev) => ({ ...prev, cookingTime: null }))
                  }}
                />
                {errors.cookingTime && (
                  <span className="field-error-text">{errors.cookingTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="recipe-prep-time" className="form-label">
                  Prep time (min)
                </label>
                <input
                  id="recipe-prep-time"
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="10"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="recipe-servings" className="form-label">
                  Servings <span className="req-star">*</span>
                </label>
                <select
                  id="recipe-servings"
                  className="form-select"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                >
                  <option value="1">1 serving</option>
                  <option value="2">2 servings</option>
                  <option value="4">4 servings</option>
                  <option value="6">6 servings</option>
                  <option value="8">8 servings</option>
                  <option value="10">10+ servings</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="recipe-difficulty" className="form-label">
                  Difficulty level
                </label>
                <select
                  id="recipe-difficulty"
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Cuisine Row */}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="recipe-category" className="form-label">
                  Category
                </label>
                <select
                  id="recipe-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="recipe-cuisine" className="form-label">
                  Cuisine (optional)
                </label>
                <input
                  id="recipe-cuisine"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mediterranean, Italian, Mexican"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                />
              </div>
            </div>

            {/* Cover Image Upload matching Figma upload box */}
            <div className="form-group">
              <div className="image-mode-toggle">
                <span className="form-label">Cover photo</span>
                <div className="mode-buttons">
                  <button
                    type="button"
                    className={`mode-btn ${imageInputMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setImageInputMode('upload')}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${imageInputMode === 'url' ? 'active' : ''}`}
                    onClick={() => setImageInputMode('url')}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <label className="upload-box-container">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden-file-input"
                    onChange={handleFileUpload}
                  />
                  <div className="upload-box-content">
                    <span className="upload-box-icon">📷</span>
                    <span className="upload-box-text">
                      {image ? 'Change photo' : '+ Upload image'} · JPG or PNG, up to 2 MB
                    </span>
                  </div>
                </label>
              ) : (
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste image URL (https://...)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              )}

              {errors.image && <span className="field-error-text">{errors.image}</span>}

              {image && (
                <div className="image-preview-badge">
                  <img src={image} alt="Preview" className="thumb-preview" />
                  <span className="thumb-caption">Cover image attached</span>
                  <button
                    type="button"
                    className="thumb-remove-btn"
                    onClick={() => setImage('')}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Ingredients Section matching Figma */}
            <div className={`form-group ${errors.ingredients ? 'has-error' : ''}`}>
              <div className="section-label-row">
                <label className="form-label">
                  Ingredients <span className="req-star">*</span>
                </label>
                <span className="label-hint">Item name, quantity & unit</span>
              </div>

              <div className="dynamic-list-wrapper">
                {ingredientItems.map((item, index) => (
                  <div key={item.id} className="dynamic-row ingredient-row">
                    <input
                      type="text"
                      className="form-input qty-input"
                      placeholder="Qty (e.g. 1)"
                      value={item.quantity}
                      onChange={(e) =>
                        handleIngredientChange(index, 'quantity', e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="form-input unit-input"
                      placeholder="Unit (e.g. can, cup, tbsp)"
                      value={item.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input name-input"
                      placeholder="Ingredient name (e.g. white beans, drained)"
                      value={item.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-row-remove"
                      onClick={() => handleRemoveIngredient(index)}
                      disabled={ingredientItems.length <= 1}
                      title={
                        ingredientItems.length <= 1
                          ? 'At least one ingredient field is required'
                          : 'Remove ingredient'
                      }
                      aria-label="Remove ingredient"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {errors.ingredients && (
                <span className="field-error-text">{errors.ingredients}</span>
              )}

              <button
                type="button"
                className="btn-add-row"
                onClick={handleAddIngredient}
              >
                + Add ingredient
              </button>
            </div>

            {/* Preparation steps Section matching Figma */}
            <div className={`form-group ${errors.instructions ? 'has-error' : ''}`}>
              <div className="section-label-row">
                <label className="form-label">
                  Preparation steps <span className="req-star">*</span>
                </label>
                <span className="label-hint">Step-by-step cooking instructions</span>
              </div>

              <div className="dynamic-list-wrapper">
                {instructions.map((step, index) => (
                  <div key={index} className="dynamic-row step-row">
                    <span className="step-counter">{index + 1}.</span>
                    <textarea
                      className="form-textarea step-input"
                      rows="2"
                      placeholder={`Describe step ${index + 1}...`}
                      value={step}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-row-remove"
                      onClick={() => handleRemoveInstruction(index)}
                      disabled={instructions.length <= 1}
                      title={
                        instructions.length <= 1
                          ? 'At least one step is required'
                          : 'Remove step'
                      }
                      aria-label="Remove step"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {errors.instructions && (
                <span className="field-error-text">{errors.instructions}</span>
              )}

              <button
                type="button"
                className="btn-add-row"
                onClick={handleAddInstruction}
              >
                + Add step
              </button>
            </div>

            {/* Dietary Tags Section matching Figma */}
            <div className="form-group dietary-tags-group">
              <div className="dietary-tags-header">
                <span className="form-label">Dietary tags</span>
                <div className="tag-dropdown-wrapper">
                  <button
                    type="button"
                    className="tag-dropdown-toggle"
                    onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                  >
                    Select tags ▾
                  </button>

                  {isTagDropdownOpen && (
                    <div className="tag-dropdown-menu">
                      {AVAILABLE_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={`tag-menu-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleToggleTag(tag)}
                          >
                            <span>{isSelected ? '✓ ' : '+ '}</span>
                            <span>{tag}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Chips */}
              <div className="selected-tag-chips">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <span key={tag} className="tag-chip-interactive">
                      {tag}
                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() => handleRemoveTag(tag)}
                        title={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="no-tags-note">No dietary tags selected yet.</span>
                )}
              </div>

              {/* Helper note from Figma */}
              <p className="dietary-helper-note">
                Verify tags and list any allergens before publishing. Recipes are visible to the
                community.
              </p>
            </div>

            {/* Summary preview bar */}
            <div className="form-summary-card">
              <div className="summary-stat">
                <span className="stat-label">Total Time:</span>
                <span className="stat-val">{totalTimeMinutes} min</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Ingredients:</span>
                <span className="stat-val">
                  {ingredientItems.filter((i) => i.name.trim()).length}
                </span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Steps:</span>
                <span className="stat-val">
                  {instructions.filter((s) => s.trim()).length}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-preview-recipe"
                onClick={handleOpenPreview}
              >
                Preview recipe
              </button>
              <button
                type="submit"
                className="btn-publish-recipe"
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish recipe'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Preview Modal */}
      <RecipePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onPublish={handlePublish}
        recipeData={buildRecipePayload()}
        isPublishing={isPublishing}
      />

      {/* Success / Error Notification */}
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
