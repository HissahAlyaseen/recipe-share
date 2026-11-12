function sameLine(a, b) {
  return String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase()
}

/**
 * Replace the ingredient line matching `fromLine` with `toLine`.
 * Returns the same list when there is nothing to replace.
 */
export function replaceIngredientLine(ingredients, fromLine, toLine) {
  const list = Array.isArray(ingredients) ? ingredients : []
  if (!String(fromLine ?? '').trim() || !String(toLine ?? '').trim()) return list
  const index = list.findIndex((line) => sameLine(line, fromLine))
  if (index === -1) return list
  return list.map((line, idx) => (idx === index ? toLine : line))
}

/**
 * Apply ingredient substitutions to an ingredient list so a swapped ingredient
 * is shown as its replacement instead of the original line.
 */
export function applySubstitutions(ingredients, substitutions) {
  let list = Array.isArray(ingredients) ? [...ingredients] : []
  if (!Array.isArray(substitutions)) return list
  for (const swap of substitutions) {
    if (!swap) continue
    list = replaceIngredientLine(list, swap.original, swap.replacement)
  }
  return list
}
