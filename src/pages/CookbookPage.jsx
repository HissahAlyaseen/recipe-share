import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { cookbookStorage } from '../services/cookbookStorage'
import { bookmarkStorage } from '../services/bookmarkStorage'
import { recipeStorage } from '../services/recipeStorage'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import Toast from '../components/common/Toast'
import CreateCookbookModal from '../components/cookbook/CreateCookbookModal'
import RenameCookbookModal from '../components/cookbook/RenameCookbookModal'
import DeleteCookbookModal from '../components/cookbook/DeleteCookbookModal'
import SaveToCookbookModal from '../components/cookbook/SaveToCookbookModal'
import AddRecipesToCollectionModal from '../components/cookbook/AddRecipesToCollectionModal'
import BookmarkButton from '../components/common/BookmarkButton'
import './CookbookPage.css'

export default function CookbookPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const userId = user?.id || 'user-1'

  // URL state: collection ID or view mode
  const activeColId = searchParams.get('collection')
  const viewMode = searchParams.get('view') // 'all' or null

  // Local state initialized from storage
  const [collections, setCollections] = useState(() => cookbookStorage.getUserCollections(userId))
  const [savedRecipeIds, setSavedRecipeIds] = useState(() => cookbookStorage.getSavedRecipeIds(userId))
  const [bookmarks, setBookmarks] = useState(() => bookmarkStorage.getUserBookmarks(userId))
  const [sortBy, setSortBy] = useState('recent') // 'recent' | 'title' | 'time'
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [collectionToRename, setCollectionToRename] = useState(null)
  const [collectionToDelete, setCollectionToDelete] = useState(null)
  const [recipeToOrganize, setRecipeToOrganize] = useState(null)
  const [isAddRecipesModalOpen, setIsAddRecipesModalOpen] = useState(false)

  // Refresh data from storage
  const refreshCookbook = () => {
    setCollections(cookbookStorage.getUserCollections(userId))
    setSavedRecipeIds(cookbookStorage.getSavedRecipeIds(userId))
    setBookmarks(bookmarkStorage.getUserBookmarks(userId))
  }

  // Keep toast visible even when unbookmarking removes the card from view
  const handleBookmarkToggle = (isSaved, _bookmark, message) => {
    refreshCookbook()
    if (message) {
      setToast({
        type: isSaved ? 'success' : 'info',
        message
      })
    }
  }

  // Active collection object if in collection view
  const currentCollection = useMemo(() => {
    if (!activeColId) return null
    return collections.find((c) => String(c.id) === String(activeColId)) || null
  }, [collections, activeColId])

  // Get full recipe objects for all saved IDs
  const allSavedRecipes = useMemo(() => {
    return savedRecipeIds
      .map((id) => recipeStorage.getById(id))
      .filter(Boolean)
  }, [savedRecipeIds])

  // Recipes currently shown (Overview, Collection, or All Saved)
  const displayedRecipes = useMemo(() => {
    const savedAtById = new Map()
    bookmarks.forEach((bm) => {
      savedAtById.set(Number(bm.recipeId), Date.parse(bm.createdAt || '') || 0)
    })

    let list
    if (currentCollection) {
      // Show recipes in current collection
      list = (currentCollection.recipeIds || [])
        .map((id) => recipeStorage.getById(id))
        .filter(Boolean)
    } else {
      list = [...allSavedRecipes]
    }

    // Apply search filter if present
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q) ||
          r.authorName?.toLowerCase().includes(q)
      )
    }

    // Apply sorting before overview slice so newly saved recipes appear first
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'time') {
        return (Number(a.cookingTime) || 0) - (Number(b.cookingTime) || 0)
      }
      const aTime = savedAtById.get(Number(a.id)) ?? (Date.parse(a.createdAt || '') || 0)
      const bTime = savedAtById.get(Number(b.id)) ?? (Date.parse(b.createdAt || '') || 0)
      return bTime - aTime
    })

    if (!currentCollection && viewMode !== 'all') {
      return sorted.slice(0, 4)
    }
    return sorted
  }, [currentCollection, viewMode, allSavedRecipes, bookmarks, searchTerm, sortBy])

  // Map helper to find which collection(s) a recipe belongs to
  const getRecipeCollectionNames = (recipeId) => {
    return collections
      .filter((col) => col.recipeIds?.includes(Number(recipeId)))
      .map((col) => col.name)
  }

  // --- Handlers ---

  const handleCreateCollection = ({ name, description }) => {
    try {
      const created = cookbookStorage.createCollection(userId, { name, description })
      refreshCookbook()
      setToast({
        type: 'success',
        message: `Cookbook "${created.name}" created successfully.`
      })
      return created
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create cookbook.' })
      return null
    }
  }

  const handleRenameCollection = (colId, newName, newDesc) => {
    try {
      const updated = cookbookStorage.renameCollection(userId, colId, newName, newDesc)
      refreshCookbook()
      setToast({
        type: 'success',
        message: `Cookbook renamed to "${updated.name}".`
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to rename cookbook.' })
    }
  }

  const handleDeleteCollection = (colId) => {
    const target = collections.find((c) => String(c.id) === String(colId))
    try {
      cookbookStorage.deleteCollection(userId, colId)
      refreshCookbook()
      if (activeColId === colId) {
        setSearchParams({})
      }
      setToast({
        type: 'success',
        message: `Collection "${target?.name || ''}" has been deleted.`
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete collection.' })
    }
  }

  const handleRemoveFromCollection = (recipeId, colId) => {
    const col = collections.find((c) => String(c.id) === String(colId))
    const recipe = recipeStorage.getById(recipeId)
    try {
      cookbookStorage.removeRecipeFromCollection(userId, colId, recipeId)
      refreshCookbook()
      setToast({
        type: 'success',
        message: `Removed "${recipe?.title || 'Recipe'}" from ${col?.name || 'collection'}.`
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to remove from collection.' })
    }
  }

  const handleUnsaveEntirely = (recipeId) => {
    const recipe = recipeStorage.getById(recipeId)
    try {
      cookbookStorage.unsaveRecipe(userId, recipeId)
      refreshCookbook()
      setToast({
        type: 'success',
        message: `Removed "${recipe?.title || 'Recipe'}" from your saved cookbook.`
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to remove recipe.' })
    }
  }

  const handleAssignToCollection = (recipeId, targetColIds) => {
    const recipe = recipeStorage.getById(recipeId)
    const idList = Array.isArray(targetColIds)
      ? targetColIds
      : targetColIds
        ? [targetColIds]
        : []
    try {
      const updatedCols = cookbookStorage.setRecipeCollections(userId, recipeId, idList)
      const selectedCols = updatedCols.filter((c) => idList.includes(String(c.id)))
      refreshCookbook()
      setToast({
        type: 'success',
        message:
          selectedCols.length > 0
            ? `Saved "${recipe?.title}" to ${selectedCols.map((c) => c.name).join(', ')}.`
            : `Updated collections for "${recipe?.title}" (saved in All saved recipes).`
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save recipe.' })
    }
  }

  const handleAddRecipesToCollection = (colId, recipeIdsToAdd) => {
    const col = collections.find((c) => String(c.id) === String(colId))
    try {
      recipeIdsToAdd.forEach((rId) => {
        cookbookStorage.addRecipeToCollection(userId, colId, rId)
      })
      refreshCookbook()
      setToast({
        type: 'success',
        message: `Added ${recipeIdsToAdd.length} ${
          recipeIdsToAdd.length === 1 ? 'recipe' : 'recipes'
        } to "${col?.name || 'collection'}".`
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to add recipes to collection.' })
    }
  }

  // --- Views Navigation ---
  const handleOpenCollection = (colId) => {
    setSearchParams({ collection: colId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewAllSaved = () => {
    setSearchParams({ view: 'all' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToOverview = () => {
    setSearchParams({})
    setSearchTerm('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="cookbook-page-wrapper">
      <Header />

      <main className="cookbook-main">
        <div className="cookbook-container">
          {/* Top navigation row */}
          {(currentCollection || viewMode === 'all') ? (
            <div className="top-nav-link-row">
              <button
                type="button"
                className="back-link-btn"
                onClick={handleBackToOverview}
              >
                ‹ Back to Cookbooks
              </button>
            </div>
          ) : (
            <div className="top-nav-link-row">
              <Link to="/my-recipes" className="back-link-btn">
                ‹ Back to my recipes
              </Link>
            </div>
          )}

          {/* VIEW 1: SPECIFIC COLLECTION VIEW */}
          {currentCollection && (
            <div className="collection-detail-view">
              <header className="page-heading-block">
                <div className="collection-header-row">
                  <div>
                    <h1 className="page-title">{currentCollection.name}</h1>
                    <p className="page-meta-line">
                      {currentCollection.recipeIds?.length || 0}{' '}
                      {(currentCollection.recipeIds?.length || 0) === 1 ? 'recipe' : 'recipes'} · Private
                    </p>
                  </div>
                  <div className="collection-actions-group">
                    <button
                      type="button"
                      className="btn-edit-col-text"
                      onClick={() => setCollectionToRename(currentCollection)}
                    >
                      Edit cookbook
                    </button>
                    <span className="action-sep">·</span>
                    <button
                      type="button"
                      className="btn-edit-col-text delete"
                      onClick={() => setCollectionToDelete(currentCollection)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {currentCollection.description && (
                  <p className="collection-description-text">
                    {currentCollection.description}
                  </p>
                )}
              </header>

              {/* Action Toolbar to add saved recipes to this collection */}
              <div className="collection-actions-toolbar">
                <button
                  type="button"
                  className="btn-add-to-col-action"
                  onClick={() => setIsAddRecipesModalOpen(true)}
                >
                  + Add saved recipes to this collection
                </button>
              </div>

              {/* Saved recipes header row */}
              <div className="results-header-row">
                <h2 className="section-title">Saved recipes</h2>
                <div className="sort-wrapper">
                  <label htmlFor="col-sort-select" className="sort-label">
                    Sort:
                  </label>
                  <select
                    id="col-sort-select"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Recently saved ▾</option>
                    <option value="title">Title A-Z ▾</option>
                    <option value="time">Cooking time ▾</option>
                  </select>
                </div>
              </div>

              {/* Recipe Cards List */}
              <div className="recipes-list-grid">
                {displayedRecipes.length > 0 ? (
                  displayedRecipes.map((recipe) => (
                    <article key={recipe.id} className="recipe-list-card">
                      <div className="recipe-card-thumb">
                        <div className="card-thumb-bookmark-btn">
                          <BookmarkButton
                            recipeId={recipe.id}
                            recipe={recipe}
                            variant="icon"
                            size="sm"
                            onToggle={handleBookmarkToggle}
                            showToast={false}
                          />
                        </div>
                        {recipe.image ? (
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="thumb-img"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="thumb-placeholder">
                            <span className="thumb-icon-rect" />
                            <span className="thumb-text">Recipe photo</span>
                          </div>
                        )}
                      </div>

                      <div className="recipe-card-content">
                        <h3 className="recipe-card-title">{recipe.title}</h3>
                        <div className="recipe-card-meta">
                          <span>{recipe.cookingTime || 20} min</span>
                          {recipe.category && (
                            <>
                              <span className="meta-sep">·</span>
                              <span>{recipe.category}</span>
                            </>
                          )}
                          {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                            <>
                              <span className="meta-sep">·</span>
                              <span>{recipe.dietaryTags.join(', ')}</span>
                            </>
                          )}
                        </div>

                        <div className="recipe-card-author">
                          Created by {recipe.authorName || 'Home Cook'}
                        </div>

                        <div className="recipe-card-actions">
                          <Link to={`/recipes/${recipe.id}`} className="action-link">
                            View recipe
                          </Link>
                          <span className="action-sep">·</span>
                          <button
                            type="button"
                            className="action-link-btn"
                            onClick={() => setRecipeToOrganize(recipe)}
                          >
                            Organize
                          </button>
                          <span className="action-sep">·</span>
                          <button
                            type="button"
                            className="action-link-btn delete-action"
                            onClick={() => handleRemoveFromCollection(recipe.id, currentCollection.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-cookbook-card">
                    <p className="empty-title">This collection is empty.</p>
                    <p className="empty-desc">
                      Add recipes from your other collections or save community recipes here.
                    </p>
                    <button
                      type="button"
                      className="btn-empty-action"
                      onClick={() => setIsAddRecipesModalOpen(true)}
                    >
                      + Add saved recipes
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Action link */}
              <Link to="/recipes" className="btn-find-more-white">
                Find more recipes
              </Link>
            </div>
          )}

          {/* VIEW 2: ALL SAVED RECIPES VIEW */}
          {viewMode === 'all' && !currentCollection && (
            <div className="all-saved-view">
              <header className="page-heading-block">
                <h1 className="page-title">All saved recipes</h1>
                <p className="page-subtitle">
                  {allSavedRecipes.length} {allSavedRecipes.length === 1 ? 'recipe' : 'recipes'} bookmarked in your personal cookbook.
                </p>
              </header>

              {/* Search input box */}
              <div className="search-section">
                <label htmlFor="search-saved-input" className="search-label">
                  Search saved recipes
                </label>
                <div className="search-input-box">
                  <input
                    id="search-saved-input"
                    type="text"
                    className="search-input"
                    placeholder="Search by title, category, or chef"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="btn-search"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Results header & sort */}
              <div className="results-header-row">
                <span className="results-count">
                  {displayedRecipes.length} {displayedRecipes.length === 1 ? 'recipe' : 'recipes'}
                </span>
                <div className="sort-wrapper">
                  <label htmlFor="all-sort-select" className="sort-label">
                    Sort:
                  </label>
                  <select
                    id="all-sort-select"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Recently saved ▾</option>
                    <option value="title">Title A-Z ▾</option>
                    <option value="time">Cooking time ▾</option>
                  </select>
                </div>
              </div>

              {/* Recipes Grid */}
              <div className="recipes-list-grid">
                {displayedRecipes.length > 0 ? (
                  displayedRecipes.map((recipe) => {
                    const colNames = getRecipeCollectionNames(recipe.id)
                    return (
                      <article key={recipe.id} className="recipe-list-card">
                        <div className="recipe-card-thumb">
                          <div className="card-thumb-bookmark-btn">
                            <BookmarkButton
                              recipeId={recipe.id}
                              recipe={recipe}
                              variant="icon"
                              size="sm"
                              onToggle={handleBookmarkToggle}
                              showToast={false}
                            />
                          </div>
                          {recipe.image ? (
                            <img
                              src={recipe.image}
                              alt={recipe.title}
                              className="thumb-img"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="thumb-placeholder">
                              <span className="thumb-icon-rect" />
                              <span className="thumb-text">Recipe photo</span>
                            </div>
                          )}
                        </div>

                        <div className="recipe-card-content">
                          <h3 className="recipe-card-title">{recipe.title}</h3>
                          <div className="recipe-card-meta">
                            <span>{recipe.cookingTime || 20} min</span>
                            <span className="meta-sep">·</span>
                            <span>{recipe.servings || 2} servings</span>
                            {recipe.difficulty && (
                              <>
                                <span className="meta-sep">·</span>
                                <span>{recipe.difficulty}</span>
                              </>
                            )}
                          </div>

                          {/* Collection tags if assigned */}
                          {colNames.length > 0 && (
                            <div className="card-dietary-chips">
                              {colNames.map((name) => (
                                <span key={name} className="card-chip collection-chip">
                                  📁 {name}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="recipe-card-author">
                            Created by {recipe.authorName || 'Home Cook'}
                          </div>

                          <div className="recipe-card-actions">
                            <Link to={`/recipes/${recipe.id}`} className="action-link">
                              View recipe
                            </Link>
                            <span className="action-sep">·</span>
                            <button
                              type="button"
                              className="action-link-btn"
                              onClick={() => setRecipeToOrganize(recipe)}
                            >
                              Organize
                            </button>
                            <span className="action-sep">·</span>
                            <button
                              type="button"
                              className="action-link-btn delete-action"
                              onClick={() => handleUnsaveEntirely(recipe.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })
                ) : (
                  <div className="empty-cookbook-card">
                    <p className="empty-title">No saved recipes found.</p>
                    <p className="empty-desc">
                      {searchTerm
                        ? `No saved recipes match "${searchTerm}".`
                        : "You haven't saved any recipes to your cookbook yet."}
                    </p>
                    <Link to="/recipes" className="btn-empty-action">
                      Browse community recipes
                    </Link>
                  </div>
                )}
              </div>

              {/* Bottom Action link */}
              <Link to="/recipes" className="btn-find-more-white">
                Find more recipes
              </Link>
            </div>
          )}

          {/* VIEW 3: MAIN OVERVIEW (Matching Figma 'Personal Cookbook.jpg') */}
          {!currentCollection && viewMode !== 'all' && (
            <div className="cookbook-overview-view">
              <header className="page-heading-block">
                <h1 className="page-title">My Cookbooks</h1>
                <p className="page-subtitle">
                  Keep saved recipes in your private collections.
                </p>
              </header>

              {/* Primary Create Button */}
              <button
                type="button"
                className="btn-create-cookbook-primary"
                onClick={() => setIsCreateOpen(true)}
              >
                + Create new cookbook
              </button>

              {/* Section: Your collections */}
              <section className="collections-section">
                <h2 className="section-title">Your collections</h2>

                <div className="collections-list">
                  {collections.map((col) => {
                    const count = col.recipeIds?.length || 0
                    return (
                      <div key={col.id} className="collection-summary-card">
                        <div className="col-card-top-row">
                          <h3 className="col-card-name">{col.name}</h3>
                          <button
                            type="button"
                            className="btn-open-col"
                            onClick={() => handleOpenCollection(col.id)}
                          >
                            Open ›
                          </button>
                        </div>

                        <div className="col-card-bottom-row">
                          <span className="col-card-count">
                            {count} {count === 1 ? 'recipe' : 'recipes'} · Private
                          </span>
                          <div className="col-card-actions">
                            <button
                              type="button"
                              className="col-action-btn"
                              onClick={() => setCollectionToRename(col)}
                            >
                              Rename
                            </button>
                            <span className="action-sep">·</span>
                            <button
                              type="button"
                              className="col-action-btn delete"
                              onClick={() => setCollectionToDelete(col)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Section: Recently saved */}
              <section className="recently-saved-section">
                <div className="recently-saved-header-row">
                  <h2 className="section-title">Recently saved</h2>
                  <button
                    type="button"
                    className="btn-view-all-saved"
                    onClick={handleViewAllSaved}
                  >
                    View all saved ›
                  </button>
                </div>

                <div className="recipes-list-grid">
                  {displayedRecipes.length > 0 ? (
                    displayedRecipes.map((recipe) => {
                      const colNames = getRecipeCollectionNames(recipe.id)
                      const colLabel = colNames.length > 0 ? colNames.join(', ') : 'Saved'
                      return (
                        <article key={recipe.id} className="recipe-list-card">
                          <div className="recipe-card-thumb">
                            <div className="card-thumb-bookmark-btn">
                              <BookmarkButton
                                recipeId={recipe.id}
                                recipe={recipe}
                                variant="icon"
                                size="sm"
                                onToggle={handleBookmarkToggle}
                                showToast={false}
                              />
                            </div>
                            {recipe.image ? (
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="thumb-img"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="thumb-placeholder">
                                <span className="thumb-icon-rect" />
                                <span className="thumb-text">Recipe photo</span>
                              </div>
                            )}
                          </div>

                          <div className="recipe-card-content">
                            <h3 className="recipe-card-title">{recipe.title}</h3>
                            <div className="recipe-card-meta">
                              <span>By {recipe.authorName || 'Chef'}</span>
                              <span className="meta-sep">·</span>
                              <span>{colLabel}</span>
                            </div>

                            <div className="recipe-card-actions">
                              <Link to={`/recipes/${recipe.id}`} className="action-link">
                                View
                              </Link>
                              <span className="action-sep">·</span>
                              <Link to={`/recipes/${recipe.id}/customize`} className="action-link">
                                Customize
                              </Link>
                              <span className="action-sep">·</span>
                              <button
                                type="button"
                                className="action-link-btn"
                                onClick={() => setRecipeToOrganize(recipe)}
                              >
                                Organize
                              </button>
                              <span className="action-sep">·</span>
                              <button
                                type="button"
                                className="action-link-btn delete-action"
                                onClick={() => handleUnsaveEntirely(recipe.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })
                  ) : (
                    <div className="empty-cookbook-card">
                      <p className="empty-title">No saved recipes yet</p>
                      <p className="empty-desc">
                        Recipes you save will appear here in your personal collections.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Info callout matching Figma wireframe */}
              <div className="cookbook-info-callout">
                <p className="callout-text">
                  Deleting a collection never deletes its recipes. They remain in All saved recipes.
                </p>
              </div>

              {/* Bottom Action link */}
              <Link to="/recipes" className="btn-find-more-white">
                Find more recipes
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <CreateCookbookModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateCollection}
        existingCollections={collections}
      />

      <RenameCookbookModal
        isOpen={!!collectionToRename}
        onClose={() => setCollectionToRename(null)}
        collection={collectionToRename}
        onRename={handleRenameCollection}
        existingCollections={collections}
      />

      <DeleteCookbookModal
        isOpen={!!collectionToDelete}
        onClose={() => setCollectionToDelete(null)}
        collection={collectionToDelete}
        onDelete={handleDeleteCollection}
      />

      <SaveToCookbookModal
        isOpen={!!recipeToOrganize}
        onClose={() => setRecipeToOrganize(null)}
        recipe={recipeToOrganize}
        collections={collections}
        onSave={handleAssignToCollection}
        onCreateCollection={handleCreateCollection}
      />

      <AddRecipesToCollectionModal
        isOpen={isAddRecipesModalOpen}
        onClose={() => setIsAddRecipesModalOpen(false)}
        collection={currentCollection}
        allSavedRecipes={allSavedRecipes}
        onAddRecipes={handleAddRecipesToCollection}
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
