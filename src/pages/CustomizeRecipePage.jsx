import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStorageSync } from '../hooks/useStorageSync'
import { recipeStorage, RECIPES_UPDATED_EVENT } from '../services/recipeStorage'
import { cookbookStorage, COOKBOOK_UPDATED_EVENT } from '../services/cookbookStorage'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import Toast from '../components/common/Toast'
import ResetCustomizationModal from '../components/cookbook/ResetCustomizationModal'
import { applySubstitutions, replaceIngredientLine } from '../utils/customizationUtils'
import './CustomizeRecipePage.css'

const SUGGESTED_PERSONAL_TAGS = [
  'Quick',
  'Meal prep',
  'Kid-friendly',
  'Spicy',
  'Dairy-free',
  'Low-carb',
  'Make-ahead'
]

function buildInitialSubstitutions(existingCust) {
  if (!existingCust) return []
  if (Array.isArray(existingCust.substitutions) && existingCust.substitutions.length > 0) {
    return existingCust.substitutions
  }
  if (existingCust.ingredientReplaced || existingCust.replacementIngredient) {
    return [
      {
        original: existingCust.ingredientReplaced || '',
        replacement: existingCust.replacementIngredient || ''
      }
    ]
  }
  return []
}

function getInitialFormState(recipe, existingCust, collections) {
  const subs = buildInitialSubstitutions(existingCust)
  const firstSwap = subs[0]

  return {
    customServings: existingCust?.customServings || recipe?.servings || 2,
    modifiedIngredients:
      existingCust?.modifiedIngredients?.length > 0
        ? [...existingCust.modifiedIngredients]
        : [...(recipe?.ingredients || [])],
    substitutions: subs,
    draftOriginal: firstSwap?.original || recipe?.ingredients?.[0] || '',
    draftReplacement: firstSwap?.replacement || '',
    modifiedInstructions:
      existingCust?.modifiedInstructions?.length > 0
        ? [...existingCust.modifiedInstructions]
        : [...(recipe?.instructions || [])],
    personalNotes: existingCust?.personalNotes || '',
    personalTags: Array.isArray(existingCust?.personalTags) ? [...existingCust.personalTags] : [],
    selectedCollectionId: existingCust
      ? existingCust.collectionId || ''
      : collections.find((c) => c.recipeIds?.some((rid) => Number(rid) === Number(recipe?.id)))?.id ?? ''
  }
}

export default function CustomizeRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const activeUserId = isAuthenticated === false ? null : user?.id || null

  const storageRevision = useStorageSync([RECIPES_UPDATED_EVENT, COOKBOOK_UPDATED_EVENT])

  const recipe = useMemo(() => {
    void storageRevision
    return recipeStorage.getById(id)
  }, [id, storageRevision])
  const collections = useMemo(() => {
    void storageRevision
    return activeUserId ? cookbookStorage.getUserCollections(activeUserId) : []
  }, [activeUserId, storageRevision])
  const existingCustomization = useMemo(() => {
    void storageRevision
    return activeUserId && recipe ? cookbookStorage.getCustomization(activeUserId, recipe.id) : null
  }, [activeUserId, recipe, storageRevision])

  const initial = useMemo(
    () => getInitialFormState(recipe, existingCustomization, collections),
    [recipe, existingCustomization, collections]
  )

  const [customServings, setCustomServings] = useState(initial.customServings)
  const [modifiedIngredients, setModifiedIngredients] = useState(initial.modifiedIngredients)
  const [substitutions, setSubstitutions] = useState(initial.substitutions)
  const [selectedIngredient, setSelectedIngredient] = useState(initial.draftOriginal)
  const [replacement, setReplacement] = useState(initial.draftReplacement)
  const [modifiedInstructions, setModifiedInstructions] = useState(initial.modifiedInstructions)
  const [personalNotes, setPersonalNotes] = useState(initial.personalNotes)
  const [personalTags, setPersonalTags] = useState(initial.personalTags)
  const [customTagInput, setCustomTagInput] = useState('')
  const [selectedCollectionId, setSelectedCollectionId] = useState(initial.selectedCollectionId)

  const [savedSuccessData, setSavedSuccessData] = useState(null)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  // Clear confirmation view only when navigating between recipes or users (not on post-save storage sync)
  const routeSyncKey = `${activeUserId || 'guest'}_${recipe?.id || 'none'}`
  const [prevRouteSyncKey, setPrevRouteSyncKey] = useState(routeSyncKey)
  if (prevRouteSyncKey !== routeSyncKey) {
    setPrevRouteSyncKey(routeSyncKey)
    setSavedSuccessData(null)
    setIsResetModalOpen(false)
  }

  // Keep form synchronized when navigating across recipe IDs, users, or reset updates
  const syncKey = `${routeSyncKey}_${existingCustomization?.updatedAt || 'fresh'}`
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey)
  if (prevSyncKey !== syncKey) {
    setPrevSyncKey(syncKey)
    setCustomServings(initial.customServings)
    setModifiedIngredients(initial.modifiedIngredients)
    setSubstitutions(initial.substitutions)
    setSelectedIngredient(initial.draftOriginal)
    setReplacement(initial.draftReplacement)
    setModifiedInstructions(initial.modifiedInstructions)
    setPersonalNotes(initial.personalNotes)
    setPersonalTags(initial.personalTags)
    setCustomTagInput('')
    setSelectedCollectionId(initial.selectedCollectionId)
    setError('')
  }

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

  if (!activeUserId) {
    return (
      <div className="customize-page-wrapper">
        <Header />
        <main className="customize-main">
          <div className="customize-container">
            <h1 className="page-title">Sign in required</h1>
            <p className="page-subtitle">
              Please sign in to create and save private recipe customizations.
            </p>
            <Link to={`/recipes/${recipe.id}`} className="btn-find-more-white" style={{ marginTop: '20px' }}>
              Back to recipe
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // Ingredient quantity / line handlers
  const handleIngredientChange = (index, value) => {
    setModifiedIngredients((prev) => prev.map((item, idx) => (idx === index ? value : item)))
    if (error) setError('')
  }

  const handleAddIngredient = () => {
    setModifiedIngredients((prev) => [...prev, ''])
  }

  const handleRemoveIngredient = (index) => {
    setModifiedIngredients((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Substitutions handlers
  const handleAddSubstitution = () => {
    const trimmed = replacement.trim()
    if (!trimmed) {
      setError('Enter a replacement ingredient before adding a swap.')
      return
    }
    const orig = selectedIngredient || recipe.ingredients?.[0] || ''
    const previousSwap = substitutions.find((s) => s.original === orig)
    setSubstitutions((prev) => {
      const existingIdx = prev.findIndex((s) => s.original === orig)
      if (existingIdx >= 0) {
        return prev.map((s, idx) => (idx === existingIdx ? { original: orig, replacement: trimmed } : s))
      }
      return [...prev, { original: orig, replacement: trimmed }]
    })
    // Show the swap in the ingredient list itself, not only as a note
    setModifiedIngredients((prev) => {
      const swapped = replaceIngredientLine(prev, orig, trimmed)
      if (swapped !== prev || !previousSwap) return swapped
      return replaceIngredientLine(prev, previousSwap.replacement, trimmed)
    })
    setReplacement('')
    setError('')
    setToast({ type: 'success', message: `Added swap: ${orig} → ${trimmed}` })
  }

  const handleRemoveSubstitution = (index) => {
    const removed = substitutions[index]
    setSubstitutions((prev) => prev.filter((_, idx) => idx !== index))
    // Put the original ingredient back in the list
    if (removed) {
      setModifiedIngredients((prev) =>
        replaceIngredientLine(prev, removed.replacement, removed.original)
      )
    }
  }

  // Instruction handlers
  const handleInstructionChange = (index, value) => {
    setModifiedInstructions((prev) => prev.map((step, idx) => (idx === index ? value : step)))
    if (error) setError('')
  }

  const handleAddInstruction = () => {
    setModifiedInstructions((prev) => [...prev, ''])
  }

  const handleRemoveInstruction = (index) => {
    setModifiedInstructions((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Personal tags handlers
  const handleToggleTag = (tag) => {
    setPersonalTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
    if (error) setError('')
  }

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim()
    if (!trimmed) return
    if (!personalTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setPersonalTags((prev) => [...prev, trimmed])
    }
    setCustomTagInput('')
    if (error) setError('')
  }

  const handleReset = () => {
    setCustomServings(recipe.servings || 2)
    setModifiedIngredients([...(recipe.ingredients || [])])
    setSubstitutions([])
    setSelectedIngredient(recipe.ingredients?.[0] || '')
    setReplacement('')
    setModifiedInstructions([...(recipe.instructions || [])])
    setPersonalNotes('')
    setPersonalTags([])
    setCustomTagInput('')
    setError('')
  }

  const handleConfirmResetCustomization = () => {
    try {
      cookbookStorage.resetCustomization(activeUserId, recipe.id)
      handleReset()
      setSavedSuccessData(null)
      setIsResetModalOpen(false)
      setToast({
        type: 'info',
        message: 'Customization reset to the original recipe. Your bookmark and collections remain intact.'
      })
    } catch (err) {
      setError(err.message || 'Failed to reset customization.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Merge active draft swap into substitutions list cleanly
    const finalSwaps = [...substitutions]
    if (replacement.trim()) {
      const orig = selectedIngredient || recipe.ingredients?.[0] || ''
      const idx = finalSwaps.findIndex((s) => s.original === orig)
      if (idx >= 0) {
        finalSwaps[idx] = { original: orig, replacement: replacement.trim() }
      } else {
        finalSwaps.push({ original: orig, replacement: replacement.trim() })
      }
    }

    // Apply every swap (including a typed-but-not-added one) to the ingredient list
    const cleanIngredients = applySubstitutions(
      modifiedIngredients.map((item) => item.trim()).filter(Boolean),
      finalSwaps
    )
    const cleanInstructions = modifiedInstructions.map((step) => step.trim()).filter(Boolean)
    const servingsNum = Math.max(1, Number(customServings) || recipe.servings || 2)
    const cleanNotes = personalNotes.trim()
    const cleanTags = personalTags.map((t) => t.trim()).filter(Boolean)

    const servingsChanged = servingsNum !== (Number(recipe.servings) || 2)
    const ingredientsChanged =
      JSON.stringify(cleanIngredients) !== JSON.stringify(recipe.ingredients || [])
    const instructionsChanged =
      JSON.stringify(cleanInstructions) !== JSON.stringify(recipe.instructions || [])

    if (
      !servingsChanged &&
      !ingredientsChanged &&
      !instructionsChanged &&
      finalSwaps.length === 0 &&
      !cleanNotes &&
      cleanTags.length === 0
    ) {
      setError('Make at least one customization (servings, ingredients, substitutions, instructions, notes, or tags).')
      return
    }

    const chosenCol = collections.find((c) => String(c.id) === String(selectedCollectionId))

    const customizationData = {
      originalTitle: recipe.title,
      customTitle: `${recipe.title} · My version`,
      customServings: servingsNum,
      modifiedIngredients: cleanIngredients,
      substitutions: finalSwaps,
      ingredientReplaced: finalSwaps[0]?.original || '',
      replacementIngredient: finalSwaps[0]?.replacement || '',
      modifiedInstructions: cleanInstructions,
      personalNotes: cleanNotes,
      personalTags: cleanTags,
      collectionId: chosenCol ? chosenCol.id : null,
      collectionName: chosenCol ? chosenCol.name : '',
      allergenNotes:
        finalSwaps.length > 0
          ? `Original contains ingredients that were substituted. Replacements: ${finalSwaps
              .map((s) => `${s.original} → ${s.replacement}`)
              .join('; ')}`
          : ''
    }

    try {
      cookbookStorage.saveCustomization(activeUserId, recipe.id, customizationData)
      setSavedSuccessData({
        recipeTitle: recipe.title,
        customServings: servingsNum,
        substitutions: finalSwaps,
        ingredientsCount: cleanIngredients.length,
        instructionsCount: cleanInstructions.length,
        personalNotes: cleanNotes,
        personalTags: cleanTags,
        collectionName: chosenCol ? chosenCol.name : 'All saved recipes',
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

              <div className="saved-alert-banner">
                <p className="alert-banner-title">✓ Customized copy saved</p>
                <p className="alert-banner-desc">
                  Your private version was saved to {savedSuccessData.collectionName}.{' '}
                  {savedSuccessData.authorName}&apos;s original recipe is unchanged.
                </p>
              </div>

              <h2 className="customized-headline">
                {savedSuccessData.recipeTitle} · My version
              </h2>

              <div className="saved-summary-meta">
                <span>👥 {savedSuccessData.customServings} servings</span>
                <span>·</span>
                <span>🥗 {savedSuccessData.ingredientsCount} ingredients</span>
                <span>·</span>
                <span>📝 {savedSuccessData.instructionsCount} steps</span>
              </div>

              {savedSuccessData.substitutions.length > 0 && (
                <div className="saved-swaps-list">
                  {savedSuccessData.substitutions.map((swap, i) => (
                    <p key={i} className="replacement-summary-line">
                      Ingredient replaced: <strong>{swap.original}</strong> →{' '}
                      <strong>{swap.replacement}</strong>
                    </p>
                  ))}
                </div>
              )}

              {savedSuccessData.personalTags.length > 0 && (
                <div className="saved-personal-tags-row">
                  {savedSuccessData.personalTags.map((tag) => (
                    <span key={tag} className="personal-tag-pill readonly">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {savedSuccessData.personalNotes && (
                <p className="saved-notes-preview">
                  <strong>Personal notes:</strong> {savedSuccessData.personalNotes}
                </p>
              )}

              {savedSuccessData.substitutions.length > 0 && (
                <div className="allergen-callout-box">
                  <h3 className="allergen-callout-heading">Check replacement labels</h3>
                  <p className="allergen-callout-body">
                    Allergen information changes with substitutions. Check every ingredient label and
                    cross-contact risk before cooking.
                  </p>
                </div>
              )}

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

  // MAIN FORM VIEW (Preserving existing Figma UI & extending cleanly)
  return (
    <div className="customize-page-wrapper">
      <Header />

      <main className="customize-main">
        <div className="customize-container">
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

          <div className="private-version-callout">
            <h3 className="private-callout-title">Your private version</h3>
            <p className="private-callout-desc">
              Save changes as a private copy visible only to you.{' '}
              {recipe.authorName || 'The author'}&apos;s original recipe remains unchanged.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="customize-form" noValidate>
            {/* 1. Serving Size */}
            <div className="form-group">
              <div className="customize-section-header">
                <label htmlFor="custom-servings-input" className="form-label">
                  Serving size
                </label>
                <span className="field-hint-inline">
                  Original: {recipe.servings || 2} servings
                </span>
              </div>
              <div className="servings-stepper-row">
                <button
                  type="button"
                  className="btn-stepper"
                  onClick={() => setCustomServings((s) => Math.max(1, (Number(s) || 1) - 1))}
                  aria-label="Decrease servings"
                >
                  −
                </button>
                <input
                  id="custom-servings-input"
                  type="number"
                  min="1"
                  max="50"
                  className="form-input servings-number-input"
                  value={customServings}
                  onChange={(e) => setCustomServings(Math.max(1, Number(e.target.value) || 1))}
                />
                <button
                  type="button"
                  className="btn-stepper"
                  onClick={() => setCustomServings((s) => Math.min(50, (Number(s) || 1) + 1))}
                  aria-label="Increase servings"
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. Ingredient Quantities & Ingredients */}
            <div className="form-group">
              <div className="customize-section-header">
                <span className="form-label">Ingredients &amp; quantities</span>
                <button
                  type="button"
                  className="btn-inline-add"
                  onClick={handleAddIngredient}
                >
                  + Add ingredient
                </button>
              </div>
              <p className="field-hint" style={{ marginTop: '-2px', marginBottom: '4px' }}>
                Adjust ingredient amounts or add items for your customized serving size.
              </p>

              <div className="editable-list-stack">
                {modifiedIngredients.map((item, idx) => (
                  <div key={idx} className="editable-line-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 2 cups chickpeas, rinsed"
                      value={item}
                      onChange={(e) => handleIngredientChange(idx, e.target.value)}
                      aria-label={`Ingredient ${idx + 1}`}
                    />
                    {modifiedIngredients.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-line"
                        onClick={() => handleRemoveIngredient(idx)}
                        title="Remove ingredient"
                        aria-label={`Remove ingredient ${idx + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Ingredient Substitutions (Preserving original Figma swap UI) */}
            <div className="form-group">
              <label htmlFor="replace-ingredient-select" className="form-label">
                Ingredient substitution
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

            <div className="form-group">
              <label htmlFor="replacement-input" className="form-label">
                Replacement ingredient (optional)
              </label>
              <div className="swap-input-action-row">
                <input
                  id="replacement-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 50 g dairy-free feta"
                  value={replacement}
                  onChange={(e) => {
                    setReplacement(e.target.value)
                    if (error) setError('')
                  }}
                />
                <button
                  type="button"
                  className="btn-add-swap-secondary"
                  onClick={handleAddSubstitution}
                >
                  + Add swap
                </button>
              </div>
              <p className="field-hint">
                Enter a swap or add multiple ingredient substitutions below.
              </p>

              {substitutions.length > 0 && (
                <div className="active-swaps-list">
                  {substitutions.map((swap, idx) => (
                    <div key={idx} className="active-swap-chip">
                      <span>
                        <strong>{swap.original}</strong> → {swap.replacement}
                      </span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => handleRemoveSubstitution(idx)}
                        aria-label={`Remove substitution ${swap.original}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Personal Cooking Instructions */}
            <div className="form-group">
              <div className="customize-section-header">
                <span className="form-label">Personal cooking instructions</span>
                <button
                  type="button"
                  className="btn-inline-add"
                  onClick={handleAddInstruction}
                >
                  + Add step
                </button>
              </div>
              <div className="editable-list-stack">
                {modifiedInstructions.map((step, idx) => (
                  <div key={idx} className="editable-step-row">
                    <span className="step-idx-badge">{idx + 1}.</span>
                    <textarea
                      rows={2}
                      className="form-input step-textarea"
                      placeholder={`Step ${idx + 1} instructions...`}
                      value={step}
                      onChange={(e) => handleInstructionChange(idx, e.target.value)}
                      aria-label={`Step ${idx + 1}`}
                    />
                    {modifiedInstructions.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-line"
                        onClick={() => handleRemoveInstruction(idx)}
                        title="Remove step"
                        aria-label={`Remove step ${idx + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Personal Notes */}
            <div className="form-group">
              <label htmlFor="personal-notes-input" className="form-label">
                Personal cooking notes
              </label>
              <textarea
                id="personal-notes-input"
                rows={3}
                className="form-input"
                placeholder="e.g. Bake 5 minutes longer for crispier edges; kids prefer mild spice..."
                value={personalNotes}
                onChange={(e) => {
                  setPersonalNotes(e.target.value)
                  if (error) setError('')
                }}
              />
            </div>

            {/* 6. Personal Tags */}
            <div className="form-group">
              <span className="form-label">Personal tags</span>
              <div className="personal-tags-picker">
                {SUGGESTED_PERSONAL_TAGS.map((tag) => {
                  const isActive = personalTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`personal-tag-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleToggleTag(tag)}
                      aria-pressed={isActive}
                    >
                      {isActive ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  )
                })}
              </div>

              <div className="custom-tag-add-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add custom tag (e.g. Ramadan Iftar)"
                  value={customTagInput}
                  maxLength={30}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomTag()
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-swap-secondary"
                  onClick={handleAddCustomTag}
                >
                  Add tag
                </button>
              </div>

              {personalTags.length > 0 && (
                <div className="selected-tags-row">
                  {personalTags.map((tag) => (
                    <span key={tag} className="personal-tag-pill">
                      #{tag}
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => handleToggleTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reset actions */}
            <div className="swap-actions-row">
              {existingCustomization && (
                <button
                  type="button"
                  className="btn-reset-swap danger"
                  onClick={() => setIsResetModalOpen(true)}
                >
                  Reset to original recipe
                </button>
              )}
              <button
                type="button"
                className="btn-reset-swap"
                onClick={handleReset}
              >
                Reset form to original
              </button>
            </div>

            {error && <p className="field-error">{error}</p>}

            {/* Allergen warning box matching Figma */}
            <div className="allergen-warning-box">
              <h4 className="allergen-warning-title">Allergen information changes</h4>
              <p className="allergen-warning-desc">
                Original may contain allergens. Replacement ingredients might contain soy, nuts or
                other allergens. Filters and substitutions do not guarantee allergy safety. Check
                every ingredient, product label and cross-contact risk before cooking.
              </p>
            </div>

            {/* Save to cookbook collection selector */}
            {collections.length > 0 && (
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
                  <option value="">No collection · All saved recipes only</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.recipeIds?.length || 0} recipes)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="btn-save-customized-primary">
              Save customized copy
            </button>
          </form>
        </div>
      </main>

      <ResetCustomizationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        recipeTitle={recipe.title}
        authorName={recipe.authorName}
        onConfirm={handleConfirmResetCustomization}
      />

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
