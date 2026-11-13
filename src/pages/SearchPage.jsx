
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import RecipeCard from '../components/common/RecipeCard'

import { recipeStorage } from '../services/recipeStorage'
import { matchesUserDietaryPreferences } from '../utils/dietaryUtils'

import './SearchPage.css'
import { useStorageSync } from '../hooks/useStorageSync'
import { RECIPES_UPDATED_EVENT } from '../services/recipeStorage'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [recipes, setRecipes] = useState(() => recipeStorage.getAll())

    useStorageSync([RECIPES_UPDATED_EVENT], () => {
    setRecipes(recipeStorage.getAll())
    })
  const [selectedDiets, setSelectedDiets] = useState([])
  const [selectedAllergens, setSelectedAllergens] = useState([])

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Low-Carb',
    'Pescatarian'
  ]

  const toggleDiet = (diet) => {
    setSelectedDiets((previous) =>
      previous.includes(diet)
        ? previous.filter((item) => item !== diet)
        : [...previous, diet]
    )
  }
  const allergenOptions = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame'
]

const toggleAllergen = (allergen) => {
  setSelectedAllergens((previous) =>
    previous.includes(allergen)
      ? previous.filter((item) => item !== allergen)
      : [...previous, allergen]
  )
}
const clearAllFilters = () => {
  setSelectedDiets([])
  setSelectedAllergens([])
}
  // Search by title, ingredients, and dietary preferences
  const searchResults = recipes.filter((recipe) => {
    const keyword = query.trim().toLowerCase()

    // Hide draft recipes
    if (recipe.status?.toLowerCase() === 'draft') {
      return false
    }

    const titleMatches = (recipe.title || '')
      .toLowerCase()
      .includes(keyword)

    const ingredientsMatch = (recipe.ingredients || [])
      .some((ingredient) => {
        const ingredientName =
          typeof ingredient === 'string'
            ? ingredient
            : ingredient?.name || ''

        return ingredientName.toLowerCase().includes(keyword)
      })

    const matchesSearch =
      !keyword || titleMatches || ingredientsMatch


        const matchesDietAndAllergies =
        matchesUserDietaryPreferences(recipe, {
            dietPreferences: selectedDiets,
            allergensToAvoid: selectedAllergens,
            customDietaryRestrictions: []
        })


    return matchesSearch && matchesDietAndAllergies
  })

  return (
    <div className="search-page">
      <Header />

      <main className="search-content">
        <Link to="/" className="search-back">
          ‹ Back to Home
        </Link>

        <h1>Search Recipes</h1>

        <p>
          Search results for: {query || 'All recipes'}
        </p>

        {/* Dietary Filters */}
        <section className="dietary-filters">
          <h2>Dietary Preferences</h2>
          <p>Select one or more dietary preferences.</p>

          <div className="dietary-options">
            {dietaryOptions.map((diet) => (
              <label key={diet} className="dietary-option">
                <input
                  type="checkbox"
                  checked={selectedDiets.includes(diet)}
                  onChange={() => toggleDiet(diet)}
                />
                <span>{diet}</span>
              </label>
            ))}
          </div>
        </section>
        
{/* Allergy Filters */}
<section className="allergy-filters">
  <h2>Allergies to Avoid</h2>
  <p>Select ingredients you want to avoid.</p>

  <div className="allergy-options">
    {allergenOptions.map((allergen) => (
      <label key={allergen} className="allergy-option">
        <input
          type="checkbox"
          checked={selectedAllergens.includes(allergen)}
          onChange={() => toggleAllergen(allergen)}
        />
        <span>{allergen}</span>
      </label>
    ))}
  </div>
</section>
    <div className="filter-actions">
    <button
        type="button"
        onClick={clearAllFilters}
        disabled={
        selectedDiets.length === 0 &&
        selectedAllergens.length === 0
        }
    >
        Clear All Filters
    </button>
    </div>
        {/* Search Results */}
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
              />
            ))
          ) : (
            <p className="search-empty">
              No recipes match your search or selected filters.
              Try changing or clearing your filters.
            </p>
          )}
        </div>
        
      </main>

      <BottomNav />
    </div>
  )
}

export default SearchPage
