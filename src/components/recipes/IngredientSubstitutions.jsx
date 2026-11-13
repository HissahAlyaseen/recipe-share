import './IngredientSubstitutions.css'
import { ingredientSubstitutions } from '../../data/ingredientSubstitutions'

function IngredientSubstitutions({ ingredients = [] }) {
  const suggestions = ingredients.flatMap((ingredient) => {
    const name =
      typeof ingredient === 'string'
        ? ingredient
        : ingredient?.name || ''

    const matchedKey = Object.keys(ingredientSubstitutions)
      .find((key) => key.toLowerCase() === name.trim().toLowerCase())

    if (!matchedKey) return []

    return [{
      ingredient: name,
      alternatives: ingredientSubstitutions[matchedKey]
    }]
  })

  if (suggestions.length === 0) {
    return null
  }

  return (
    <section className="ingredient-substitutions">
      <h3>Suggested Ingredient Substitutions</h3>

      <ul>
        {suggestions.map((item) => (
          <li key={item.ingredient}>
            <strong>{item.ingredient}</strong>
            <span> → {item.alternatives.join(', ')}</span>
          </li>
        ))}
      </ul>

      <p>
        Substitutions are suggestions only.
        Always check ingredients and allergen labels.
      </p>
    </section>
  )
}

export default IngredientSubstitutions
