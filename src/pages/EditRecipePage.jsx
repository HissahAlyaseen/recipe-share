import { useState, useId } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recipeStorage } from '../services/recipeStorage'
import RecipePreviewModal from '../components/recipes/RecipePreviewModal'
import Toast from '../components/common/Toast'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import './EditRecipePage.css'

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

function normalizeIngredients(ingredients, ingredientItems) {
  if (Array.isArray(ingredientItems) && ingredientItems.length > 0) {
    return ingredientItems.map((item, idx) => ({
      id: item.id || `ing-${idx}-${Date.now()}`,
      quantity: item.quantity || '',
      unit: item.unit || '',
      name: item.name || ''
    }))
  }

  if (Array.isArray(ingredients) && ingredients.length > 0) {
    return ingredients.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id || `ing-${idx}-${Date.now()}`,
          quantity: item.quantity || '',
          unit: item.unit || '',
          name: item.name || ''
        }
      }
      return {
        id: `ing-${idx}-${Date.now()}`,
        quantity: '',
        unit: '',
        name: String(item)
      }
    })
  }

  return [{ id: 'ing-1', quantity: '', unit: '', name: '' }]
}

export default function EditRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const componentInstanceId = useId()

  // Fetch initial recipe synchronously
  const [existingRecipe] = useState(() => recipeStorage.getById(id))

  // Form State initialized from existing recipe
  const [title, setTitle] = useState(() => existingRecipe?.title || '')
  const [description, setDescription] = useState(() => existingRecipe?.description || '')
  const [category, setCategory] = useState(() => existingRecipe?.category || 'Dinner')
  const [cuisine, setCuisine] = useState(() => existingRecipe?.cuisine || '')
  const [prepTime, setPrepTime] = useState(() => String(existingRecipe?.prepTime ?? '10'))
  const [cookingTime, setCookingTime] = useState(() => String(existingRecipe?.cookingTime ?? '20'))
  const [servings, setServings] = useState(() => String(existingRecipe?.servings ?? '2'))
  const [difficulty, setDifficulty] = useState(() => existingRecipe?.difficulty || 'Easy')
  const [image, setImage] = useState(() => existingRecipe?.image || '')
  const [imageInputMode, setImageInputMode] = useState('upload')

  // Ingredients & Instructions
  const [ingredientItems, setIngredientItems] = useState(() =>
    normalizeIngredients(existingRecipe?.ingredients, existingRecipe?.ingredientItems)
  )

  const [instructions, setInstructions] = useState(() => {
    if (Array.isArray(existingRecipe?.instructions) && existingRecipe.instructions.length > 0) {
      return [...existingRecipe.instructions]
    }
    return ['']
  })

  // Dietary Tags
  const [selectedTags, setSelectedTags] = useState(() => {
    return Array.isArray(existingRecipe?.dietaryTags) ? [...existingRecipe.dietaryTags] : []
  })
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)

  // Validation & UI State
  const [errors, setErrors] = useState({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [toast, setToast] = useState(null)

  // Guard: Not found or unauthorized
  if (!existingRecipe) {
    return (
      <div className="edit-recipe-page-wrapper">
        <Header />
        <main className="edit-recipe-main">
          <div className="not-found-card">
            <h2>Recipe Not Found</h2>
            <p>The recipe you are trying to edit does not exist.</p>
            <Link to="/my-recipes" className="btn-back-home">
              Back to My Recipes
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // Ensure only author can edit
  const isAuthor = user?.id && String(existingRecipe.authorId) === String(user.id)
  if (!isAuthor) {
    return (
      <div className="edit-recipe-page-wrapper">
        <Header />
        <main className="edit-recipe-main">
          <div className="not-found-card">
            <h2>Access Denied</h2>
            <p>You can only edit recipes that you have created.</p>
            <Link to="/my-recipes" className="btn-back-home">
              Back to My Recipes
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // --- Handlers: Ingredients ---
  const handleAddIngredient = () => {
    setIngredientItems((prev) => [
      ...prev,
      { id: `ing-${componentInstanceId}-${Date.now()}-${prev.length}`, quantity: '', unit: '', name: '' }
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

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size exceeds 10 MB limit.' }))
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

    const cook = Number(cookingTime)
    if (isNaN(cook) || cook <= 0) {
      newErrors.cookingTime = 'Cooking time must be at least 1 minute.'
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

    return {
      title: title.trim(),
      description: description.trim(),
      category,
      cuisine: cuisine.trim(),
      prepTime: Number(prepTime) || 0,
      cookingTime: Number(cookingTime) || 1,
      servings: Number(servings) || 2,
      difficulty,
      image: image || existingRecipe.image,
      ingredients: formattedIngredients,
      ingredientItems,
      instructions: cleanedSteps,
      dietaryTags: selectedTags
    }
  }

  // --- Handlers: Save Changes ---
  const handleSaveChanges = () => {
    if (!validateForm()) {
      setToast({
        type: 'error',
        message: 'Please resolve errors in the highlighted fields.'
      })
      return
    }

    setIsSaving(true)

    try {
      const payload = buildRecipePayload()
      recipeStorage.update(existingRecipe.id, user.id, payload)

      setIsPreviewOpen(false)
      setSaveSuccess(true)
      setToast({
        type: 'success',
        message: 'Changes saved successfully!'
      })

      // Auto-navigate back to My Recipes after a moment, or user can click Back
      setTimeout(() => {
        navigate('/my-recipes')
      }, 1500)
    } catch (err) {
      console.error('Failed to update recipe:', err)
      setToast({
        type: 'error',
        message: err.message || 'Failed to update recipe.'
      })
      setIsSaving(false)
    }
  }

  return (
    <div className="edit-recipe-page-wrapper">
      <Header />

      <main className="edit-recipe-main">
        <div className="edit-recipe-container">
          {/* Top navigation link matching Figma */}
          <div className="top-nav-link-row">
            <Link to="/my-recipes" className="back-link">
              ‹ Cancel · Back to my recipes
            </Link>
          </div>

          <header className="page-heading-block">
            <h1 className="page-title">Edit Recipe</h1>
            <p className="page-subtitle">
              Shared by {user?.name || 'Alex'} · <span className="req-star">*</span> Required fields
            </p>
          </header>

          {/* Form matching Figma edit recipe.jpg */}
          <form
            className="recipe-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveChanges()
            }}
            noValidate
          >
            {/* Title */}
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label htmlFor="edit-recipe-title" className="form-label">
                Recipe title <span className="req-star">*</span>
              </label>
              <input
                id="edit-recipe-title"
                type="text"
                className="form-input"
                placeholder="Recipe title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((prev) => ({ ...prev, title: null }))
                  setSaveSuccess(false)
                }}
              />
              {errors.title && <span className="field-error-text">{errors.title}</span>}
            </div>

            {/* Short Description */}
            <div className="form-group">
              <label htmlFor="edit-recipe-desc" className="form-label">
                Short description
              </label>
              <textarea
                id="edit-recipe-desc"
                className="form-textarea desc-textarea"
                rows="2"
                placeholder="A brief introduction or serving recommendation..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setSaveSuccess(false)
                }}
              />
            </div>

            {/* Time & Servings Grid */}
            <div className="form-grid-2">
              <div className={`form-group ${errors.cookingTime ? 'has-error' : ''}`}>
                <label htmlFor="edit-cook-time" className="form-label">
                  Cooking time (min) <span className="req-star">*</span>
                </label>
                <input
                  id="edit-cook-time"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="20"
                  value={cookingTime}
                  onChange={(e) => {
                    setCookingTime(e.target.value)
                    if (errors.cookingTime) setErrors((prev) => ({ ...prev, cookingTime: null }))
                    setSaveSuccess(false)
                  }}
                />
                {errors.cookingTime && (
                  <span className="field-error-text">{errors.cookingTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-prep-time" className="form-label">
                  Prep time (min)
                </label>
                <input
                  id="edit-prep-time"
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="10"
                  value={prepTime}
                  onChange={(e) => {
                    setPrepTime(e.target.value)
                    setSaveSuccess(false)
                  }}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="edit-servings" className="form-label">
                  Servings
                </label>
                <select
                  id="edit-servings"
                  className="form-select"
                  value={servings}
                  onChange={(e) => {
                    setServings(e.target.value)
                    setSaveSuccess(false)
                  }}
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
                <label htmlFor="edit-difficulty" className="form-label">
                  Difficulty level
                </label>
                <select
                  id="edit-difficulty"
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value)
                    setSaveSuccess(false)
                  }}
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
                <label htmlFor="edit-category" className="form-label">
                  Category
                </label>
                <select
                  id="edit-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setSaveSuccess(false)
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-cuisine" className="form-label">
                  Cuisine
                </label>
                <input
                  id="edit-cuisine"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mediterranean, Italian, Mexican"
                  value={cuisine}
                  onChange={(e) => {
                    setCuisine(e.target.value)
                    setSaveSuccess(false)
                  }}
                />
              </div>
            </div>

            {/* Cover Image Upload matching Figma 'Change image · JPG or PNG, up to 10 MB' */}
            <div className="form-group">
              <div className="image-mode-toggle">
                <span className="form-label">Recipe image</span>
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
                    <span className="upload-box-icon">🖼️</span>
                    <span className="upload-box-text">
                      Change image · JPG or PNG, up to 10 MB
                    </span>
                  </div>
                </label>
              ) : (
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste image URL (https://...)"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value)
                    setSaveSuccess(false)
                  }}
                />
              )}

              {errors.image && <span className="field-error-text">{errors.image}</span>}

              {image && (
                <div className="image-preview-badge">
                  <img src={image} alt="Preview" className="thumb-preview" />
                  <span className="thumb-caption">Cover image loaded</span>
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
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleIngredientChange(index, 'quantity', e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="form-input unit-input"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input name-input"
                      placeholder="Ingredient name"
                      value={item.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-row-remove"
                      onClick={() => handleRemoveIngredient(index)}
                      title="Remove ingredient"
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
                <span className="label-hint">Step-by-step instructions</span>
              </div>

              <div className="dynamic-list-wrapper">
                {instructions.map((step, index) => (
                  <div key={index} className="dynamic-row step-row">
                    <span className="step-counter">{index + 1}.</span>
                    <textarea
                      className="form-textarea step-input"
                      rows="2"
                      placeholder={`Step ${index + 1}...`}
                      value={step}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-row-remove"
                      onClick={() => handleRemoveInstruction(index)}
                      title="Remove step"
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

              {/* Selected Chips matching Figma */}
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
                  <span className="no-tags-note">No dietary tags selected.</span>
                )}
              </div>
            </div>

            {/* In-page Success Banner matching Figma edit recipe.jpg */}
            {saveSuccess && (
              <div className="edit-success-banner" role="status">
                <span className="success-icon">✓</span>
                <span className="success-text">Changes saved successfully</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-preview-recipe"
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview recipe
              </button>
              <button
                type="submit"
                className="btn-save-changes"
                disabled={isSaving}
              >
                {isSaving ? 'Saving changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Preview Modal */}
      <RecipePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onPublish={handleSaveChanges}
        recipeData={buildRecipePayload()}
        isPublishing={isSaving}
      />

      {/* Toast Notification */}
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
