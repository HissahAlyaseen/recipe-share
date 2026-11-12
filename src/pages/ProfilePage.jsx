import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStorageSync } from '../hooks/useStorageSync'
import {
  profileStorage,
  extractPreferences,
  DIET_OPTIONS,
  ALLERGEN_OPTIONS
} from '../services/profileStorage'
import { recipeStorage, RECIPES_UPDATED_EVENT } from '../services/recipeStorage'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import Toast from '../components/common/Toast'
import './ProfilePage.css'

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isAuthenticated, updateUser } = useAuth()
  const activeUserId = isAuthenticated === false ? null : user?.id || null

  // View state: 'profile' (default), 'preferences' (edit mode), 'profile_saved', 'preferences_saved'
  const viewMode = searchParams.get('view') || 'profile'

  // Initial profile loaded for the authenticated user
  const [profile, setProfile] = useState(() =>
    activeUserId ? profileStorage.getProfile(activeUserId, user) : null
  )
  const [name, setName] = useState(() => profile?.name ?? user?.name ?? '')
  const [email, setEmail] = useState(() => profile?.email ?? user?.email ?? '')

  // Preferences form state (no hardcoded diet/allergen fallbacks)
  const [selectedDiets, setSelectedDiets] = useState(() => profile?.dietPreferences || [])
  const [selectedAllergens, setSelectedAllergens] = useState(() => profile?.allergensToAvoid || [])
  const [customRestrictions, setCustomRestrictions] = useState(
    () => profile?.customDietaryRestrictions || []
  )
  const [customRestrictionInput, setCustomRestrictionInput] = useState('')
  const [customInputError, setCustomInputError] = useState('')

  // Feedback toast
  const [toast, setToast] = useState(null)

  // Synchronize state whenever the authenticated user switches or auth context updates externally
  const authPrefs = extractPreferences(user || {})
  const userSyncSignature = activeUserId
    ? `${activeUserId}::${user?.name || ''}::${user?.email || ''}::${JSON.stringify(
        authPrefs.dietaryPreferences
      )}`
    : 'guest'
  const [prevUserSyncSig, setPrevUserSyncSig] = useState(userSyncSignature)

  if (prevUserSyncSig !== userSyncSignature) {
    setPrevUserSyncSig(userSyncSignature)
    const reloaded = activeUserId ? profileStorage.getProfile(activeUserId, user) : null
    setProfile(reloaded)
    setName(reloaded?.name ?? user?.name ?? '')
    setEmail(reloaded?.email ?? user?.email ?? '')
    setSelectedDiets(reloaded?.dietPreferences || [])
    setSelectedAllergens(reloaded?.allergensToAvoid || [])
    setCustomRestrictions(reloaded?.customDietaryRestrictions || [])
    setCustomRestrictionInput('')
    setCustomInputError('')
  }

  const recipeRevision = useStorageSync([RECIPES_UPDATED_EVENT])

  // Dynamic user recipes count
  const myRecipesCount = useMemo(() => {
    void recipeRevision
    return activeUserId ? recipeStorage.getByAuthor(activeUserId).length : 0
  }, [activeUserId, recipeRevision])

  if (!activeUserId) {
    return (
      <div className="profile-page-wrapper">
        <Header />
        <main className="profile-main">
          <div className="profile-container">
            <div className="profile-view-card">
              <header className="profile-header-block">
                <h1 className="profile-top-title">Sign in required</h1>
                <p className="profile-subtitle">
                  Please sign in to view and manage your profile and dietary preferences.
                </p>
              </header>
              <Link to="/recipes" className="btn-secondary-action">
                Discover recipes
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // --- Handlers ---

  const handleSaveProfile = (e) => {
    e?.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setToast({ type: 'error', message: 'Name cannot be empty.' })
      return
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setToast({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    try {
      const updated = profileStorage.updateProfile(
        activeUserId,
        {
          name: trimmedName,
          email: trimmedEmail
        },
        user
      )
      setProfile(updated)
      setName(updated.name)
      setEmail(updated.email)
      if (updateUser) {
        updateUser({ name: updated.name, email: updated.email })
      }
      setSearchParams({ view: 'profile_saved' })
    } catch {
      setToast({ type: 'error', message: 'Failed to save profile changes.' })
    }
  }

  const handleToggleDiet = (diet) => {
    setSelectedDiets((prev) =>
      prev.some((d) => d.toLowerCase() === diet.toLowerCase())
        ? prev.filter((d) => d.toLowerCase() !== diet.toLowerCase())
        : [...prev, diet]
    )
  }

  const handleToggleAllergen = (allergen) => {
    setSelectedAllergens((prev) =>
      prev.some((a) => a.toLowerCase() === allergen.toLowerCase())
        ? prev.filter((a) => a.toLowerCase() !== allergen.toLowerCase())
        : [...prev, allergen]
    )
  }

  const handleAddCustomRestriction = () => {
    const cleaned = customRestrictionInput.trim().replace(/\s+/g, ' ')
    if (!cleaned) {
      setCustomInputError('Please enter a dietary restriction before adding.')
      return
    }
    const exists = customRestrictions.some(
      (item) => item.toLowerCase() === cleaned.toLowerCase()
    )
    if (exists) {
      setCustomInputError(`"${cleaned}" is already added.`)
      return
    }
    setCustomRestrictions((prev) => [...prev, cleaned])
    setCustomRestrictionInput('')
    setCustomInputError('')
  }

  const handleRemoveCustomRestriction = (itemToRemove) => {
    setCustomRestrictions((prev) =>
      prev.filter((item) => item.toLowerCase() !== itemToRemove.toLowerCase())
    )
    setCustomInputError('')
  }

  const handleClearAllPreferences = () => {
    setSelectedDiets([])
    setSelectedAllergens([])
    setCustomRestrictions([])
    setCustomRestrictionInput('')
    setCustomInputError('')
  }

  const handleSavePreferences = () => {
    // Auto-include a pending typed restriction if user forgot to click + Add
    let finalCustom = [...customRestrictions]
    const pendingCustom = customRestrictionInput.trim().replace(/\s+/g, ' ')
    if (
      pendingCustom &&
      !finalCustom.some((item) => item.toLowerCase() === pendingCustom.toLowerCase())
    ) {
      finalCustom.push(pendingCustom)
    }

    try {
      const updated = profileStorage.updateProfile(
        activeUserId,
        {
          dietPreferences: selectedDiets,
          allergensToAvoid: selectedAllergens,
          customDietaryRestrictions: finalCustom
        },
        user
      )
      setProfile(updated)
      setSelectedDiets(updated.dietPreferences)
      setSelectedAllergens(updated.allergensToAvoid)
      setCustomRestrictions(updated.customDietaryRestrictions)
      setCustomRestrictionInput('')
      setCustomInputError('')
      if (updateUser) {
        updateUser({
          dietPreferences: updated.dietPreferences,
          allergensToAvoid: updated.allergensToAvoid,
          customDietaryRestrictions: updated.customDietaryRestrictions,
          dietaryPreferences: updated.dietaryPreferences
        })
      }
      setSearchParams({ view: 'preferences_saved' })
    } catch {
      setToast({ type: 'error', message: 'Failed to save dietary preferences.' })
    }
  }

  // Summary label generator for preferences saved banner
  const getPreferencesSavedSummary = () => {
    const savedDiets = profile?.dietPreferences || selectedDiets
    const savedAllergens = profile?.allergensToAvoid || selectedAllergens
    const savedCustom = profile?.customDietaryRestrictions || customRestrictions

    const dietParts = savedDiets.length > 0 ? savedDiets.join(' and ') + ' selected.' : ''
    const allergenParts =
      savedAllergens.length > 0
        ? `${savedAllergens.join(', ')} excluded from recipe discovery.`
        : ''
    const customParts =
      savedCustom.length > 0
        ? `Custom restrictions: ${savedCustom.join(', ')}.`
        : ''

    if (!dietParts && !allergenParts && !customParts) {
      return 'All dietary preferences, allergen exclusions, and custom restrictions have been cleared.'
    }
    return [dietParts, allergenParts, customParts].filter(Boolean).join(' ')
  }

  const savedDietsList = profile?.dietPreferences || []
  const savedAllergensList = profile?.allergensToAvoid || []
  const savedCustomList = profile?.customDietaryRestrictions || []
  const hasAnySavedPrefs =
    savedDietsList.length > 0 || savedAllergensList.length > 0 || savedCustomList.length > 0

  return (
    <div className="profile-page-wrapper">
      <Header />

      <main className="profile-main">
        <div className="profile-container">

          {/* VIEW 1: MY PROFILE (Default Hub) */}
          {viewMode === 'profile' && (
            <div className="profile-view-card">
              <header className="profile-header-block">
                <h1 className="profile-top-title">My profile</h1>
                <h2 className="profile-greeting">
                  {profile?.name ? `Hi, ${profile.name}` : 'Hi there'}
                </h2>
                <p className="profile-subtitle">Manage your account and recipe preferences.</p>
              </header>

              {/* Personal Information Section */}
              <section className="profile-section">
                <h3 className="section-heading">Personal information</h3>
                <form onSubmit={handleSaveProfile} className="personal-info-form">
                  <div className="form-group">
                    <label htmlFor="profile-name-input" className="form-label">
                      Name
                    </label>
                    <input
                      id="profile-name-input"
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile-email-input" className="form-label">
                      Email address
                    </label>
                    <input
                      id="profile-email-input"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@university.edu"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary-action">
                    Save profile changes
                  </button>
                </form>
              </section>

              {/* Dietary Preferences Section */}
              <section className="profile-section">
                <div className="section-header-row">
                  <h3 className="section-heading">Dietary preferences</h3>
                  <button
                    type="button"
                    className="btn-edit-link"
                    onClick={() => {
                      setSelectedDiets(savedDietsList)
                      setSelectedAllergens(savedAllergensList)
                      setCustomRestrictions(savedCustomList)
                      setCustomRestrictionInput('')
                      setCustomInputError('')
                      setSearchParams({ view: 'preferences' })
                    }}
                  >
                    Edit preferences
                  </button>
                </div>

                {/* Selected Preference Chips */}
                <div className="preference-chips-list">
                  {savedDietsList.map((diet) => (
                    <span key={diet} className="pref-chip">
                      {diet}
                    </span>
                  ))}
                  {savedAllergensList.map((allergen) => (
                    <span key={allergen} className="pref-chip">
                      Avoid {allergen.toLowerCase()}
                    </span>
                  ))}
                  {savedCustomList.map((restriction) => (
                    <span key={`custom-${restriction}`} className="pref-chip pref-chip-custom">
                      {restriction}
                    </span>
                  ))}
                  {!hasAnySavedPrefs && (
                    <span className="pref-empty-note">No dietary preferences set yet.</span>
                  )}
                </div>

                {/* Allergy guidance box matching Figma */}
                <div className="guidance-box">
                  <h4 className="guidance-title">Allergy guidance</h4>
                  <p className="guidance-text">
                    Filters and substitutions do not guarantee allergy safety. Check every
                    ingredient, product label and cross-contact risk before cooking.
                  </p>
                </div>
              </section>

              {/* My recipes button card */}
              <Link to="/my-recipes" className="btn-my-recipes-card">
                <span>My recipes · {myRecipesCount}</span>
              </Link>

              {/* Footer Account Actions */}
              <div className="profile-footer-links">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => setToast({ type: 'info', message: 'Password change email link sent.' })}
                >
                  Change password
                </button>
                <button
                  type="button"
                  className="footer-link-btn danger"
                  onClick={() => setToast({ type: 'info', message: 'Signed out successfully.' })}
                >
                  Log out
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: DIETARY PREFERENCES EDITOR */}
          {viewMode === 'preferences' && (
            <div className="profile-view-card">
              <div className="top-back-row">
                <button
                  type="button"
                  className="back-cancel-btn"
                  onClick={() => setSearchParams({ view: 'profile' })}
                >
                  ‹ Cancel · Back to profile
                </button>
              </div>

              <header className="profile-header-block">
                <h1 className="profile-top-title">Dietary preferences</h1>
                <p className="profile-subtitle">
                  Choose more than one option. These preferences guide your recipe discovery.
                </p>
              </header>

              {/* Diet preferences section */}
              <section className="profile-section">
                <h3 className="section-heading">Diet preferences</h3>
                <p className="section-subtext">Select all that apply</p>

                <div className="two-column-checkbox-grid">
                  {DIET_OPTIONS.map((diet) => (
                    <label key={diet} className="pref-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedDiets.some((d) => d.toLowerCase() === diet.toLowerCase())}
                        onChange={() => handleToggleDiet(diet)}
                        className="pref-checkbox-input"
                      />
                      <span className="pref-checkbox-label">{diet}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Allergens to avoid section */}
              <section className="profile-section">
                <h3 className="section-heading">Allergens to avoid</h3>
                <p className="section-subtext">Hide recipes listing these ingredients.</p>

                <div className="two-column-checkbox-grid">
                  {ALLERGEN_OPTIONS.map((allergen) => (
                    <label key={allergen} className="pref-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedAllergens.some((a) => a.toLowerCase() === allergen.toLowerCase())}
                        onChange={() => handleToggleAllergen(allergen)}
                        className="pref-checkbox-input"
                      />
                      <span className="pref-checkbox-label">{allergen}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Custom dietary restrictions section */}
              <section className="profile-section">
                <h3 className="section-heading">Custom dietary restrictions</h3>
                <p className="section-subtext">
                  Add any other dietary restrictions or ingredients to avoid (e.g. Low sodium, No sesame oil).
                </p>

                <div className="custom-restriction-input-row">
                  <input
                    id="custom-restriction-input"
                    type="text"
                    className="form-input"
                    value={customRestrictionInput}
                    onChange={(e) => {
                      setCustomRestrictionInput(e.target.value)
                      if (customInputError) setCustomInputError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomRestriction()
                      }
                    }}
                    placeholder="e.g. Low sodium, Sugar-free, No sesame"
                    maxLength={50}
                    aria-label="Custom dietary restriction"
                  />
                  <button
                    type="button"
                    className="btn-add-restriction"
                    onClick={handleAddCustomRestriction}
                  >
                    + Add
                  </button>
                </div>

                {customInputError && (
                  <p className="custom-restriction-error" role="alert">
                    {customInputError}
                  </p>
                )}

                {customRestrictions.length > 0 ? (
                  <div className="custom-restrictions-pills" aria-label="Added custom dietary restrictions">
                    {customRestrictions.map((item) => (
                      <span key={item} className="custom-restriction-pill">
                        <span>{item}</span>
                        <button
                          type="button"
                          className="chip-remove-btn"
                          onClick={() => handleRemoveCustomRestriction(item)}
                          aria-label={`Remove ${item}`}
                          title={`Remove ${item}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="pref-empty-note" style={{ display: 'block', marginBottom: '20px' }}>
                    No custom dietary restrictions added yet.
                  </p>
                )}

                {/* Not an allergy safety check box */}
                <div className="guidance-box warning">
                  <h4 className="guidance-title">Not an allergy safety check</h4>
                  <p className="guidance-text">
                    Filters and substitutions do not guarantee allergy safety. Check every
                    ingredient, product label and cross-contact risk before cooking.
                  </p>
                </div>

                {/* Selection summary and clear all button */}
                <div className="selection-summary-row">
                  <span className="selection-count-text">
                    {selectedDiets.length} diet {selectedDiets.length === 1 ? 'preference' : 'preferences'} ·{' '}
                    {selectedAllergens.length} allergen {selectedAllergens.length === 1 ? 'exclusion' : 'exclusions'} ·{' '}
                    {customRestrictions.length} custom {customRestrictions.length === 1 ? 'restriction' : 'restrictions'}
                  </span>
                  <button
                    type="button"
                    className="btn-clear-preferences"
                    onClick={handleClearAllPreferences}
                  >
                    Clear all preferences
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={handleSavePreferences}
                >
                  Save preferences
                </button>
              </section>
            </div>
          )}

          {/* VIEW 3: PREFERENCES SAVED CONFIRMATION */}
          {viewMode === 'preferences_saved' && (
            <div className="profile-view-card">
              <header className="profile-header-block">
                <h1 className="profile-top-title">Preferences saved</h1>
              </header>

              <div className="confirmation-banner">
                <div className="banner-title">✓ Preferences saved</div>
                <div className="banner-desc">{getPreferencesSavedSummary()}</div>
              </div>

              <p className="confirmation-subtext">
                Your profile and recipe suggestions now use these preferences.
              </p>

              <div className="guidance-box">
                <h4 className="guidance-title">Remember to check labels</h4>
                <p className="guidance-text">
                  Filters and substitutions do not guarantee allergy safety. Check every
                  ingredient, product label and cross-contact risk before cooking.
                </p>
              </div>

              <div className="confirmation-actions-stack">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => setSearchParams({ view: 'profile' })}
                >
                  Back to profile
                </button>

                <Link to="/recipes" className="btn-secondary-action">
                  Discover recipes
                </Link>
              </div>
            </div>
          )}

          {/* VIEW 4: PROFILE SAVED CONFIRMATION */}
          {viewMode === 'profile_saved' && (
            <div className="profile-view-card">
              <header className="profile-header-block">
                <h1 className="profile-top-title">Profile saved</h1>
              </header>

              <div className="confirmation-banner">
                <div className="banner-title">✓ Profile changes saved</div>
                <div className="banner-desc">Your personal information is up to date.</div>
              </div>

              <div className="form-group readonly">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={profile?.name ?? name} readOnly />
              </div>

              <div className="form-group readonly">
                <label className="form-label">Email address</label>
                <input type="email" className="form-input" value={profile?.email ?? email} readOnly />
              </div>

              <button
                type="button"
                className="btn-primary-action"
                style={{ marginTop: '20px' }}
                onClick={() => setSearchParams({ view: 'profile' })}
              >
                Done · Back to profile
              </button>
            </div>
          )}

        </div>
      </main>

      <BottomNav />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
