import { extractPreferences, DIET_OPTIONS } from '../services/profileStorage.js'

const CANONICAL_DIET_TAGS = new Map(DIET_OPTIONS.map((opt) => [opt.toLowerCase(), opt]))

/**
 * Normalize recipe dietary tags to the canonical spelling used by the tag picker
 * (e.g. "Gluten-Free" -> "Gluten-free") and drop case-insensitive duplicates.
 */
export function normalizeDietaryTags(tags) {
  if (!Array.isArray(tags)) return []
  const seen = new Set()
  const result = []
  for (const tag of tags) {
    const cleaned = String(tag ?? '').trim()
    if (!cleaned) continue
    const lower = cleaned.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    result.push(CANONICAL_DIET_TAGS.get(lower) || cleaned)
  }
  return result
}

const ALLERGEN_KEYWORDS = {
  peanuts: ['peanut', 'peanuts'],
  'tree nuts': [
    'almond',
    'almonds',
    'walnut',
    'walnuts',
    'cashew',
    'cashews',
    'pistachio',
    'pistachios',
    'pecan',
    'pecans',
    'hazelnut',
    'hazelnuts',
    'macadamia',
    'pine nut',
    'pine nuts',
    'tree nut',
    'tree nuts'
  ],
  milk: [
    'milk',
    'cheese',
    'feta',
    'butter',
    'cream',
    'yogurt',
    'ghee',
    'mozzarella',
    'parmesan',
    'cheddar',
    'ricotta',
    'whey'
  ],
  eggs: ['egg', 'eggs', 'mayonnaise'],
  wheat: [
    'wheat',
    'pita',
    'bread',
    'flatbread',
    'flour',
    'pasta',
    'couscous',
    'bulgur',
    'semolina',
    'noodle',
    'noodles'
  ],
  soy: ['soy', 'soybean', 'tofu', 'edamame', 'tamari', 'miso', 'tempeh'],
  fish: [
    'fish',
    'salmon',
    'tuna',
    'cod',
    'tilapia',
    'anchovy',
    'anchovies',
    'sardine',
    'sardines',
    'trout',
    'halibut',
    'mackerel'
  ],
  shellfish: [
    'shellfish',
    'shrimp',
    'prawn',
    'prawns',
    'crab',
    'lobster',
    'clam',
    'clams',
    'mussel',
    'mussels',
    'oyster',
    'oysters',
    'scallop',
    'scallops'
  ],
  sesame: ['sesame', 'tahini', 'halva']
}

const NON_HALAL_KEYWORDS = [
  'pork',
  'bacon',
  'ham',
  'prosciutto',
  'pancetta',
  'lard',
  'wine',
  'beer',
  'rum',
  'vodka',
  'whiskey',
  'bourbon',
  'brandy'
]

function containsWholeWord(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i')
  return pattern.test(text)
}

function getIngredientLines(recipe, overrideIngredients = null) {
  const source = Array.isArray(overrideIngredients)
    ? overrideIngredients
    : Array.isArray(recipe?.ingredients)
      ? recipe.ingredients
      : []

  return source
    .map((item) =>
      typeof item === 'string'
        ? item
        : item?.name || ''
    )
    .filter(Boolean)
}

function extractCustomRestrictionKeyword(restriction) {
  const cleaned = String(restriction || '').trim().toLowerCase()
  if (!cleaned) return ''

  let term = cleaned
    .replace(/^(no|avoid|without|free of|exclude|allergic to)\s+/i, '')
    .replace(/(\s+free|-free|\s+intolerance|\s+allergy)$/i, '')
    .trim()

  // Special case: e.g. "dairy-free" -> "dairy", "sugar-free" -> "sugar"
  if (!term) term = cleaned
  return term
}

/**
 * Checks whether a recipe's ingredients conflict with a user's allergensToAvoid
 * or customDietaryRestrictions.
 */
export function getRecipeDietaryConflicts(recipe, userOrProfile, overrideIngredients = null) {
  if (!recipe || !userOrProfile) return []
  const prefs = extractPreferences(userOrProfile)
  const ingredients = getIngredientLines(recipe, overrideIngredients)
  const recipeTagsLower = (recipe.dietaryTags || []).map((t) => String(t).toLowerCase())
  const searchableInstructions = Array.isArray(recipe.instructions)
    ? recipe.instructions.join(' ')
    : ''
  const combinedIngredientsText = ingredients.join(' ').toLowerCase()
  const fullRecipeText = `${recipe.title || ''} ${combinedIngredientsText} ${searchableInstructions}`.toLowerCase()

  const conflicts = []

  // Check standard allergens
  for (const allergen of prefs.allergensToAvoid) {
    const lower = allergen.toLowerCase()
    const keywords = ALLERGEN_KEYWORDS[lower] || [lower]

    // Respect explicit safe replacements like "dairy-free feta" on ingredient lines
    const conflictingLine = ingredients.some((line) => {
      const lineLower = line.toLowerCase()
      if (lower === 'milk' && (lineLower.includes('dairy-free') || lineLower.includes('vegan'))) {
        return false
      }
      if (lower === 'wheat' && (lineLower.includes('gluten-free') || lineLower.includes('wheat-free'))) {
        return false
      }
      return keywords.some((kw) => containsWholeWord(lineLower, kw))
    })

    // Also scan instructions only for non-overridden recipes (e.g. "toast almonds" in Kabsa)
    const instructionConflict =
      !overrideIngredients &&
      !(lower === 'milk' && recipeTagsLower.includes('dairy-free')) &&
      !(lower === 'wheat' && recipeTagsLower.includes('gluten-free')) &&
      keywords.some((kw) => containsWholeWord(fullRecipeText, kw))

    if (conflictingLine || instructionConflict) {
      conflicts.push(allergen)
    }
  }

  // Check custom dietary restrictions
  for (const restriction of prefs.customDietaryRestrictions) {
    const term = extractCustomRestrictionKeyword(restriction)
    if (!term) continue

    const extraKeywords = ALLERGEN_KEYWORDS[term] || [term]
    const matched = ingredients.some((line) => {
      const lineLower = line.toLowerCase()
      if (lineLower.includes(`${term}-free`) || lineLower.includes(`${term} free`)) {
        return false
      }
      return extraKeywords.some((kw) => containsWholeWord(lineLower, kw))
    })

    if (matched) {
      conflicts.push(restriction)
    }
  }

  return conflicts
}

/**
 * Checks whether a recipe satisfies all of a user's selected dietary preferences,
 * allergen exclusions, and custom dietary restrictions.
 */
export function matchesUserDietaryPreferences(recipe, userOrProfile) {
  if (!recipe || !userOrProfile) return true
  const prefs = extractPreferences(userOrProfile)

  const conflicts = getRecipeDietaryConflicts(recipe, userOrProfile)
  if (conflicts.length > 0) return false

  if (prefs.dietPreferences.length === 0) return true

  const recipeTagsLower = (recipe.dietaryTags || []).map((t) => String(t).toLowerCase())
  const fullText = `${recipe.title || ''} ${getIngredientLines(recipe).join(' ')} ${(recipe.instructions || []).join(' ')}`.toLowerCase()

  return prefs.dietPreferences.every((diet) => {
    const lower = diet.toLowerCase()
    if (recipeTagsLower.includes(lower)) return true

    // Halal check: compatible if tagged Halal OR contains no pork/alcohol ingredients
    if (lower === 'halal') {
      return !NON_HALAL_KEYWORDS.some((kw) => containsWholeWord(fullText, kw))
    }

    // Nut-free check: compatible if no peanuts/tree nuts present
    if (lower === 'nut-free') {
      const nutKeywords = [...ALLERGEN_KEYWORDS.peanuts, ...ALLERGEN_KEYWORDS['tree nuts']]
      return !nutKeywords.some((kw) => containsWholeWord(fullText, kw))
    }

    return false
  })
}

