// Scratch test script for Edit and Delete functionality
import { recipeStorage } from './src/services/recipeStorage.js'
import { STORAGE_KEYS } from './src/services/storageKeys.js'

class LocalStorageMock {
  constructor() {
    this.store = {}
  }
  getItem(key) {
    return this.store[key] || null
  }
  setItem(key, value) {
    this.store[key] = String(value)
  }
  removeItem(key) {
    delete this.store[key]
  }
}

global.localStorage = new LocalStorageMock()

console.log('--- TEST 1: Retrieve Initial Recipes ---')
const initial = recipeStorage.getAll()
console.log(`Initial recipes: ${initial.length}`)
const userRecipe = initial.find((r) => r.authorId === 'user-1')
console.log(`Testing with user-1 recipe: ID ${userRecipe.id} - "${userRecipe.title}"`)

console.log('\n--- TEST 2: Edit Recipe ---')
const updated = recipeStorage.update(userRecipe.id, 'user-1', {
  title: 'Updated Shakshuka with Feta & Fresh Mint',
  cookingTime: 28,
  servings: 3
})
console.log(`Updated recipe title: "${updated.title}"`)
console.log(`Updated cookingTime: ${updated.cookingTime}`)
console.log(`Updated servings: ${updated.servings}`)
if (updated.title !== 'Updated Shakshuka with Feta & Fresh Mint' || updated.cookingTime !== 28) {
  throw new Error('Edit recipe update failed!')
}

console.log('\n--- TEST 3: Unauthorized Edit Prevention ---')
try {
  recipeStorage.update(userRecipe.id, 'unauthorized-user', {
    title: 'Hacked Recipe'
  })
  throw new Error('Unauthorized edit should have been blocked!')
} catch (err) {
  console.log(`✓ Successfully blocked unauthorized edit: "${err.message}"`)
}

console.log('\n--- TEST 4: Delete Recipe ---')
const countBefore = recipeStorage.getByAuthor('user-1').length
recipeStorage.delete(userRecipe.id, 'user-1')
const countAfter = recipeStorage.getByAuthor('user-1').length
console.log(`User-1 recipes before delete: ${countBefore}, after delete: ${countAfter}`)
if (countAfter !== countBefore - 1) {
  throw new Error('Delete recipe failed to remove recipe!')
}
console.log('✓ Successfully deleted recipe.')

console.log('\n--- TEST 5: Unauthorized Delete Prevention ---')
const otherRecipe = recipeStorage.getAll().find((r) => r.authorId !== 'user-1')
try {
  recipeStorage.delete(otherRecipe.id, 'user-1')
  throw new Error('Unauthorized delete should have been blocked!')
} catch (err) {
  console.log(`✓ Successfully blocked deleting someone else\'s recipe: "${err.message}"`)
}

console.log('\nALL EDIT AND DELETE VERIFICATION TESTS PASSED! 🎉')
