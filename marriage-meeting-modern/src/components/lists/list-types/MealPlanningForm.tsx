import React, { useState } from 'react'
import { Calendar, Plus, X, Sun, Moon, Apple, Coffee, ChefHat, Link, Edit3, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '../../ui/Button'
import { ListMetadata, MealPlanItem, DayName, RecipeItem } from '../../../types/marriageTypes'
import { getDayNames, getMealTypes, getMealSuggestions, generateGroceryFromMealPlan } from '../../../lib/listHelpers'

interface MealPlanningFormProps {
  metadata: ListMetadata
  onMetadataChange: (metadata: ListMetadata) => void
  onClose: () => void
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: 'Coffee' },
  { value: 'lunch', label: 'Lunch', icon: 'Sun' },
  { value: 'dinner', label: 'Dinner', icon: 'Moon' },
  { value: 'snack', label: 'Snack', icon: 'Apple' }
] as const

export const MealPlanningForm: React.FC<MealPlanningFormProps> = ({
  metadata,
  onMetadataChange,
  onClose
}) => {
  const [weekStart, setWeekStart] = useState(metadata.weekStart || new Date().toISOString().split('T')[0])
  const [meals, setMeals] = useState<MealPlanItem[]>(metadata.meals || [])
  const [recipes, setRecipes] = useState<RecipeItem[]>(metadata.recipes || [])

  // Update recipes and meals when metadata changes
  React.useEffect(() => {
    if (metadata.recipes) {
      setRecipes(metadata.recipes)
    }
    if (metadata.meals) {
      setMeals(metadata.meals)
    }
  }, [metadata.recipes, metadata.meals])
  const [selectedDay, setSelectedDay] = useState<DayName>('Monday')
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner')
  const [newMealName, setNewMealName] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [editingMeal, setEditingMeal] = useState<MealPlanItem | null>(null)
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [newRecipe, setNewRecipe] = useState<Partial<RecipeItem>>({
    name: '',
    ingredients: [],
    instructions: '',
    source: '',
    servings: 4,
    prepTime: 0,
    cookTime: 0
  })
  const [newIngredient, setNewIngredient] = useState('')

  const days = getDayNames()

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Coffee,
      Sun,
      Moon,
      Apple
    }
    return iconMap[iconName as keyof typeof iconMap] || Coffee
  }

  // Ensure metadata is properly initialized
  React.useEffect(() => {
    if (!metadata.weekStart) {
      const today = new Date().toISOString().split('T')[0]
      onMetadataChange({
        ...metadata,
        weekStart: today
      })
    }
  }, [])

  const handleWeekStartChange = (date: string) => {
    setWeekStart(date)
    onMetadataChange({
      ...metadata,
      weekStart: date
    })
  }

  const handleAddMeal = () => {
    if (!newMealName.trim()) return

    const newMeal: MealPlanItem = {
      day: selectedDay,
      mealType: selectedMealType,
      mealName: newMealName.trim()
    }

    const updatedMeals = [...meals, newMeal]
    setMeals(updatedMeals)
    onMetadataChange({
      ...metadata,
      meals: updatedMeals
    })

    setNewMealName('')
    setShowSuggestions(false)
  }

  const handleRemoveMeal = (index: number) => {
    const updatedMeals = meals.filter((_, i) => i !== index)
    setMeals(updatedMeals)
    onMetadataChange({
      ...metadata,
      meals: updatedMeals
    })
  }

  const handleEditMeal = (meal: MealPlanItem) => {
    setEditingMeal(meal)
  }

  const handleSaveMealEdit = (updatedMeal: MealPlanItem) => {
    const updatedMeals = meals.map(meal => 
      meal === editingMeal ? updatedMeal : meal
    )
    setMeals(updatedMeals)
    onMetadataChange({
      ...metadata,
      meals: updatedMeals
    })
    setEditingMeal(null)
  }

  const handleAddIngredientToRecipe = () => {
    if (!newIngredient.trim()) return
    
    const updatedIngredients = [...(newRecipe.ingredients || []), newIngredient.trim()]
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients
    })
    setNewIngredient('')
  }

  const handleRemoveIngredientFromRecipe = (index: number) => {
    const updatedIngredients = newRecipe.ingredients?.filter((_, i) => i !== index) || []
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients
    })
  }

  const handleAddRecipe = () => {
    if (!newRecipe.name || !newRecipe.ingredients?.length) return

    const recipe: RecipeItem = {
      id: Date.now().toString(),
      name: newRecipe.name,
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      source: newRecipe.source,
      servings: newRecipe.servings || 4,
      prepTime: newRecipe.prepTime || 0,
      cookTime: newRecipe.cookTime || 0
    }

    const updatedRecipes = [...recipes, recipe]
    setRecipes(updatedRecipes)
    onMetadataChange({
      ...metadata,
      recipes: updatedRecipes
    })

    setNewRecipe({
      name: '',
      ingredients: [],
      instructions: '',
      source: '',
      servings: 4,
      prepTime: 0,
      cookTime: 0
    })
    setNewIngredient('')
    setShowRecipeForm(false)
  }

  const handleLinkRecipe = (meal: MealPlanItem, recipe: RecipeItem) => {
    const updatedMeal = {
      ...meal,
      recipeId: recipe.id,
      recipe: recipe,
      ingredients: recipe.ingredients
    }
    handleSaveMealEdit(updatedMeal)
  }

  const handleAddCustomIngredient = (meal: MealPlanItem, ingredient: string) => {
    const updatedIngredients = [...(meal.ingredients || []), ingredient]
    const updatedMeal = {
      ...meal,
      ingredients: updatedIngredients,
      recipeId: undefined, // Clear recipe link when adding custom ingredients
      recipe: undefined
    }
    handleSaveMealEdit(updatedMeal)
  }

  const handleRemoveIngredient = (meal: MealPlanItem, ingredientIndex: number) => {
    const updatedIngredients = meal.ingredients?.filter((_, index) => index !== ingredientIndex) || []
    const updatedMeal = {
      ...meal,
      ingredients: updatedIngredients
    }
    handleSaveMealEdit(updatedMeal)
  }

  const handleGenerateGroceryList = () => {
    if (meals.length === 0) {
      alert('Please add some meals to your plan first!')
      return
    }

    // Generate grocery items from meal plan
    const groceryItems = generateGroceryFromMealPlan(meals)
    
    if (groceryItems.length === 0) {
      alert('No ingredients found in your meals. Please add ingredients to your meals first.')
      return
    }

    // Store the generated grocery items in metadata
    onMetadataChange({
      ...metadata,
      generatedGroceryItems: groceryItems
    })

    alert(`Generated ${groceryItems.length} grocery items from your meal plan!`)
  }

  const getMealsForDay = (day: DayName) => {
    return meals.filter(meal => meal.day === day)
  }

  const getMealsForDayAndType = (day: DayName, mealType: string) => {
    return meals.filter(meal => meal.day === day && meal.mealType === mealType)
  }

  const suggestions = getMealSuggestions(selectedMealType)

  // Meal Edit Modal Component
  const MealEditModal = ({ meal, onClose }: { meal: MealPlanItem, onClose: () => void }) => {
    const [newIngredient, setNewIngredient] = useState('')
    const [showRecipeSelector, setShowRecipeSelector] = useState(false)

    const handleAddIngredient = () => {
      if (newIngredient.trim()) {
        handleAddCustomIngredient(meal, newIngredient.trim())
        setNewIngredient('')
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit {meal.mealName}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Recipe Link Section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Link Recipe
              </h4>
              {meal.recipe ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {meal.recipe.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {meal.recipe.ingredients.length} ingredients
                      </p>
                    </div>
                    <button
                      onClick={() => handleSaveMealEdit({ ...meal, recipeId: undefined, recipe: undefined, ingredients: [] })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowRecipeSelector(!showRecipeSelector)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Link Existing Recipe
                  </Button>
                  
                  {showRecipeSelector && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="mb-2 p-1 bg-blue-100 dark:bg-blue-900/20 rounded text-xs font-mono">
                        Debug: {recipes.length} recipes available
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {recipes.map(recipe => (
                          <button
                            key={recipe.id}
                            onClick={() => {
                              handleLinkRecipe(meal, recipe)
                              setShowRecipeSelector(false)
                            }}
                            className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded border"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {recipe.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {recipe.ingredients.length} ingredients
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Ingredients Section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Custom Ingredients
              </h4>
              
              {/* Add Ingredient */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                />
                <Button
                  onClick={handleAddIngredient}
                  disabled={!newIngredient.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                {meal.ingredients?.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                    <span className="text-sm text-gray-900 dark:text-white">{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredient(meal, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!meal.ingredients || meal.ingredients.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No custom ingredients added
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                className="flex-1"
                variant="outline"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-900/20 rounded-lg">
          <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meal Planning</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Plan your meals for the week</p>
        </div>
      </div>

      {/* Week Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Week Starting
        </label>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => handleWeekStartChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Add New Meal */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Meal</h4>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Day Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayName)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Meal Type Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Meal Type
            </label>
            <select
              value={selectedMealType}
              onChange={(e) => {
                setSelectedMealType(e.target.value as any)
                setShowSuggestions(true)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {mealTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Meal Name Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
            placeholder="Enter meal name..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddMeal()}
          />
          <Button
            onClick={handleAddMeal}
            disabled={!newMealName.trim()}
            size="sm"
            className="bg-slate-600 hover:bg-slate-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        {/* Meal Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewMealName(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="px-2 py-1 bg-white dark:bg-gray-600 text-xs text-gray-700 dark:text-gray-300 rounded border hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Meal Plan Grid */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Weekly Plan</h4>
        <div className="space-y-2">
          {days.map(day => {
            const dayMeals = getMealsForDay(day)
            return (
              <div key={day} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{day}</h5>
                {dayMeals.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No meals planned</p>
                ) : (
                  <div className="space-y-2">
                    {mealTypes.map(mealType => {
                      const typeMeals = getMealsForDayAndType(day, mealType.value)
                      return typeMeals.map((meal, index) => (
                        <div key={index} className="p-2 bg-white dark:bg-gray-600 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                              {React.createElement(getIconComponent(mealType.icon), { 
                                className: "w-3 h-3" 
                              })}
                              <span className="text-sm font-medium">{meal.mealName}</span>
                              {meal.recipe && (
                                <ChefHat className="w-3 h-3 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditMeal(meal)}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Edit ingredients"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRemoveMeal(meals.indexOf(meal))}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="Remove meal"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Show ingredients preview */}
                          {(meal.ingredients && meal.ingredients.length > 0) && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Ingredients:</span> {meal.ingredients.slice(0, 3).join(', ')}
                              {meal.ingredients.length > 3 && ` +${meal.ingredients.length - 3} more`}
                            </div>
                          )}
                        </div>
                      ))
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recipe Management */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recipes</h4>
          <Button
            onClick={() => setShowRecipeForm(!showRecipeForm)}
            size="sm"
            variant="outline"
          >
            <ChefHat className="w-4 h-4 mr-1" />
            {showRecipeForm ? 'Cancel' : 'Add Recipe'}
          </Button>
        </div>

        {/* Recipe Form */}
        {showRecipeForm && (
          <div className="space-y-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded border">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white">Create New Recipe</h5>
            
            {/* Recipe Name */}
            <input
              type="text"
              value={newRecipe.name || ''}
              onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
              placeholder="Recipe name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            
            {/* Recipe Details */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={newRecipe.servings || 4}
                onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 4 })}
                placeholder="Servings"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                value={newRecipe.source || ''}
                onChange={(e) => setNewRecipe({ ...newRecipe, source: e.target.value })}
                placeholder="Source (URL or cookbook)"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Ingredients Management */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Ingredients
              </label>
              
              {/* Add Ingredient */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredientToRecipe()}
                />
                <Button
                  onClick={handleAddIngredientToRecipe}
                  disabled={!newIngredient.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {newRecipe.ingredients?.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                    <span className="text-sm text-gray-900 dark:text-white">{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredientFromRecipe(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!newRecipe.ingredients || newRecipe.ingredients.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No ingredients added yet
                  </p>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Instructions (optional)
              </label>
              <textarea
                value={newRecipe.instructions || ''}
                onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                placeholder="Cooking instructions..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowRecipeForm(false)
                  setNewRecipe({
                    name: '',
                    ingredients: [],
                    instructions: '',
                    source: '',
                    servings: 4,
                    prepTime: 0,
                    cookTime: 0
                  })
                  setNewIngredient('')
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRecipe}
                disabled={!newRecipe.name || !newRecipe.ingredients?.length}
                size="sm"
                className="flex-1"
              >
                <ChefHat className="w-4 h-4 mr-1" />
                Save Recipe
              </Button>
            </div>
          </div>
        )}

        {/* Saved Recipes */}
        <div className="mb-2 p-1 bg-yellow-100 dark:bg-yellow-900/20 rounded text-xs font-mono">
          Debug: {recipes.length} recipes in state, {metadata.recipes?.length || 0} in metadata
        </div>
        {recipes.length > 0 && (
          <div className="space-y-2">
            {recipes.map(recipe => (
              <div key={recipe.id} className="p-2 bg-white dark:bg-gray-600 rounded border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {recipe.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {recipe.ingredients.length} ingredients • {recipe.servings} servings
                    </p>
                  </div>
                  <button
                    onClick={() => setRecipes(recipes.filter(r => r.id !== recipe.id))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary and Actions */}
      {meals.length > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-800 dark:text-slate-200">
            <strong>{meals.length} meals</strong> planned for the week
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Click the edit button on any meal to add ingredients or link recipes
          </p>
          
          {/* Generate Grocery List Button */}
          <div className="mt-3">
            <Button
              onClick={handleGenerateGroceryList}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Generate Grocery List from Meals
            </Button>
          </div>
          
          {/* Show generated items count */}
          {metadata.generatedGroceryItems && metadata.generatedGroceryItems.length > 0 && (
            <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
              <p className="text-xs text-green-800 dark:text-green-200">
                ✅ Generated {metadata.generatedGroceryItems.length} grocery items
              </p>
            </div>
          )}
        </div>
      )}

      {/* Meal Edit Modal */}
      {editingMeal && (
        <MealEditModal
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
        />
      )}
    </div>
  )
}
