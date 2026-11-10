import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { profileStorage } from '../services/profileStorage'
import { recipeStorage } from '../services/recipeStorage'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import Toast from '../components/common/Toast'
import './ProfilePage.css'

const DIET_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Low-carb',
  'Pescatarian'
]

const ALLERGEN_OPTIONS = [
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Soy',
  'Shellfish'
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, updateUser } = useAuth()
  const userId = user?.id || 'user-1'

  // View state: 'profile' (default), 'preferences' (edit mode), 'profile_saved', 'preferences_saved'
  const viewMode = searchParams.get('view') || 'profile'

  // Profile data from storage
  const [profile, setProfile] = useState(() => profileStorage.getProfile(userId))
  const [name, setName] = useState(profile?.name || user?.name || '')
  const [email, setEmail] = useState(profile?.email || user?.email || '')

  // Preferences form state
  const [selectedDiets, setSelectedDiets] = useState(profile?.dietPreferences || ['Vegetarian', 'Gluten-free'])
  const [selectedAllergens, setSelectedAllergens] = useState(profile?.allergensToAvoid || ['Peanuts'])

  // Feedback toast
  const [toast, setToast] = useState(null)

  // Dynamic user recipes count
  const myRecipesCount = useMemo(() => {
    return recipeStorage.getByAuthor(userId).length
  }, [userId])

  // --- Handlers ---

  const handleSaveProfile = (e) => {
    e?.preventDefault()
    if (!name.trim()) {
      setToast({ type: 'error', message: 'Name cannot be empty.' })
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setToast({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    try {
      const updated = profileStorage.updateProfile(userId, {
        name: name.trim(),
        email: email.trim()
      })
      setProfile(updated)
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
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    )
  }

  const handleToggleAllergen = (allergen) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    )
  }

  const handleClearAllPreferences = () => {
    setSelectedDiets([])
    setSelectedAllergens([])
  }

  const handleSavePreferences = () => {
    try {
      const updated = profileStorage.updateProfile(userId, {
        dietPreferences: selectedDiets,
        allergensToAvoid: selectedAllergens
      })
      setProfile(updated)
      setSearchParams({ view: 'preferences_saved' })
    } catch {
      setToast({ type: 'error', message: 'Failed to save dietary preferences.' })
    }
  }

  // Summary label generator for preferences saved banner
  const getPreferencesSavedSummary = () => {
    const dietParts = selectedDiets.length > 0 ? selectedDiets.join(' and ') + ' selected.' : ''
    const allergenParts =
      selectedAllergens.length > 0
        ? `${selectedAllergens.join(', ')} excluded from recipe discovery.`
        : ''
    if (!dietParts && !allergenParts) {
      return 'All dietary preferences and allergen exclusions have been cleared.'
    }
    return [dietParts, allergenParts].filter(Boolean).join(' ')
  }

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
                <h2 className="profile-greeting">Hi, {profile.name || ''}</h2>
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
                      setSelectedDiets(profile.dietPreferences || [])
                      setSelectedAllergens(profile.allergensToAvoid || [])
                      setSearchParams({ view: 'preferences' })
                    }}
                  >
                    Edit preferences
                  </button>
                </div>

                {/* Selected Preference Chips */}
                <div className="preference-chips-list">
                  {profile.dietPreferences?.map((diet) => (
                    <span key={diet} className="pref-chip">
                      {diet}
                    </span>
                  ))}
                  {profile.allergensToAvoid?.map((allergen) => (
                    <span key={allergen} className="pref-chip">
                      Avoid {allergen.toLowerCase()}
                    </span>
                  ))}
                  {(!profile.dietPreferences || profile.dietPreferences.length === 0) &&
                    (!profile.allergensToAvoid || profile.allergensToAvoid.length === 0) && (
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
                        checked={selectedDiets.includes(diet)}
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
                        checked={selectedAllergens.includes(allergen)}
                        onChange={() => handleToggleAllergen(allergen)}
                        className="pref-checkbox-input"
                      />
                      <span className="pref-checkbox-label">{allergen}</span>
                    </label>
                  ))}
                </div>

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
                    {selectedAllergens.length} allergen {selectedAllergens.length === 1 ? 'exclusion' : 'exclusions'} selected
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

                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => navigate('/')}
                >
                  Discover recipes
                </button>
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
                <input type="text" className="form-input" value={profile.name || name} readOnly />
              </div>

              <div className="form-group readonly">
                <label className="form-label">Email address</label>
                <input type="email" className="form-input" value={profile.email || email} readOnly />
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

