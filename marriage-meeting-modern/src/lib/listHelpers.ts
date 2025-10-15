import { CustomList, CustomListItem, CustomListType, ListMetadata, MealPlanItem, DayName } from '../types/marriageTypes'

// Generate unique ID for lists and items
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// List type configurations
export const LIST_TYPE_CONFIG = {
  grocery: {
    icon: 'ShoppingCart',
    color: 'slate',
    label: 'Grocery',
    description: 'Shopping lists organized by store'
  },
  errand: {
    icon: 'CheckSquare',
    color: 'slate',
    label: 'Errands',
    description: 'Tasks and errands to run'
  },
  'meal-planning': {
    icon: 'Utensils',
    color: 'slate',
    label: 'Meal Planning',
    description: 'Plan meals and generate grocery lists'
  },
  packing: {
    icon: 'Luggage',
    color: 'slate',
    label: 'Packing',
    description: 'Packing lists for trips and travel'
  },
  chore: {
    icon: 'Home',
    color: 'slate',
    label: 'Chores',
    description: 'Household tasks and maintenance'
  }
} as const

// Get list type configuration
export const getListTypeConfig = (listType: CustomListType) => {
  return LIST_TYPE_CONFIG[listType]
}

// Create a new list with default values
export const createNewList = (
  listType: CustomListType,
  name: string,
  metadata: ListMetadata = {}
): CustomList => {
  let items: CustomListItem[] = []
  
  // For meal planning lists, convert meals to list items
  if (listType === 'meal-planning' && metadata.meals && metadata.meals.length > 0) {
    items = metadata.meals.map((meal, index) => ({
      id: Date.now() + index,
      text: `${meal.day} - ${meal.mealType}: ${meal.mealName}`,
      completed: false,
      source: 'meal-planning',
      category: meal.mealType
    }))
  }
  
  // For lists with selected suggestions, add them as items
  if (metadata.selectedSuggestions && metadata.selectedSuggestions.length > 0) {
    const suggestionItems = metadata.selectedSuggestions.map((suggestion, index) => ({
      id: Date.now() + index + 1000, // Offset to avoid conflicts with meal items
      text: suggestion,
      completed: false,
      source: 'suggestions',
      category: listType === 'packing' ? metadata.tripType : 'chore'
    }))
    items = [...items, ...suggestionItems]
  }
  
  return {
    id: generateId(),
    listType,
    name,
    metadata,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Create a new list item
export const createNewListItem = (
  text: string,
  source?: string,
  category?: string
): CustomListItem => {
  return {
    id: Date.now(),
    text,
    completed: false,
    source,
    category
  }
}

// Get default metadata for list type
export const getDefaultMetadata = (listType: CustomListType): ListMetadata => {
  switch (listType) {
    case 'grocery':
      return {
        storeId: '',
        storeName: ''
      }
    case 'packing':
      return {
        tripType: 'weekend'
      }
    case 'meal-planning':
      return {
        weekStart: new Date().toISOString().split('T')[0],
        meals: []
      }
    case 'errand':
      return {
        location: ''
      }
    case 'chore':
      return {
        frequency: 'weekly'
      }
    default:
      return {}
  }
}

// Get packing suggestions based on trip type
export const getPackingSuggestions = (tripType: string): string[] => {
  const suggestions: Record<string, string[]> = {
    camping: [
      'Tent', 'Sleeping bag', 'Camping chairs', 'Flashlight', 'First aid kit',
      'Bug spray', 'Sunscreen', 'Water bottles', 'Cooler', 'Camping stove'
    ],
    weekend: [
      'Toothbrush', 'Toothpaste', 'Shampoo', 'Clothes', 'Phone charger',
      'Underwear', 'Socks', 'Pajamas', 'Shoes', 'Wallet'
    ],
    flight: [
      'Passport', 'Boarding pass', 'Phone charger', 'Headphones', 'Book',
      'Snacks', 'Travel pillow', 'Eye mask', 'Hand sanitizer', 'Face mask'
    ],
    beach: [
      'Swimsuit', 'Sunscreen', 'Beach towel', 'Sunglasses', 'Hat',
      'Water bottle', 'Snacks', 'Beach chair', 'Umbrella', 'Sandals'
    ],
    business: [
      'Business cards', 'Laptop', 'Charger', 'Notebook', 'Pen',
      'Suit', 'Dress shirt', 'Tie', 'Dress shoes', 'Briefcase'
    ]
  }
  
  return suggestions[tripType] || []
}

// Get meal suggestions for meal planning
export const getMealSuggestions = (mealType: string): string[] => {
  const suggestions: Record<string, string[]> = {
    breakfast: [
      'Pancakes', 'Oatmeal', 'Eggs and toast', 'Cereal', 'Yogurt parfait',
      'Smoothie', 'French toast', 'Bagels', 'Waffles', 'Fruit salad'
    ],
    lunch: [
      'Sandwich', 'Salad', 'Soup', 'Pasta', 'Quesadilla',
      'Wrap', 'Burger', 'Pizza', 'Stir fry', 'Tacos'
    ],
    dinner: [
      'Spaghetti', 'Chicken breast', 'Salmon', 'Tacos', 'Pizza',
      'Stir fry', 'Pasta', 'Burger', 'Soup', 'Rice bowl'
    ],
    snack: [
      'Apple', 'Banana', 'Nuts', 'Crackers', 'Cheese',
      'Yogurt', 'Granola bar', 'Popcorn', 'Trail mix', 'Fruit'
    ]
  }
  
  return suggestions[mealType] || []
}

// Get chore suggestions based on category
export const getChoreSuggestions = (category: string): string[] => {
  const suggestions: Record<string, string[]> = {
    cleaning: [
      'Vacuum living room', 'Mop kitchen floor', 'Clean bathrooms', 'Dust furniture',
      'Wipe down counters', 'Clean mirrors', 'Sweep floors', 'Organize closets'
    ],
    maintenance: [
      'Change air filter', 'Check smoke detectors', 'Clean gutters', 'Oil door hinges',
      'Replace light bulbs', 'Check weather stripping', 'Service HVAC', 'Clean dryer vent'
    ],
    laundry: [
      'Wash clothes', 'Fold laundry', 'Put away clothes', 'Wash bed sheets',
      'Wash towels', 'Iron clothes', 'Sort laundry', 'Clean lint trap'
    ],
    cooking: [
      'Meal prep', 'Grocery shopping', 'Cook dinner', 'Pack lunches',
      'Clean dishes', 'Organize pantry', 'Plan meals', 'Bake bread'
    ],
    shopping: [
      'Grocery shopping', 'Buy household items', 'Pick up prescriptions', 'Get gas',
      'Buy gifts', 'Return items', 'Compare prices', 'Stock up on essentials'
    ],
    yard: [
      'Mow lawn', 'Trim hedges', 'Water plants', 'Pull weeds',
      'Rake leaves', 'Plant flowers', 'Clean patio', 'Fertilize lawn'
    ],
    organization: [
      'Organize closets', 'Sort paperwork', 'Declutter rooms', 'Label storage',
      'Create filing system', 'Organize garage', 'Sort donations', 'Clean out fridge'
    ],
    other: [
      'Schedule appointments', 'Pay bills', 'Update calendar', 'Plan events',
      'Research purchases', 'Call family', 'Update contacts', 'Backup files'
    ]
  }
  
  return suggestions[category] || []
}

// Generate grocery items from meal plan
export const generateGroceryFromMealPlan = (meals: MealPlanItem[]): CustomListItem[] => {
  const groceryItems: CustomListItem[] = []
  
  // Simple ingredient mapping (in a real app, this would be more sophisticated)
  const ingredientMap: Record<string, string[]> = {
    'Pancakes': ['Flour', 'Eggs', 'Milk', 'Butter', 'Syrup'],
    'Spaghetti': ['Pasta', 'Tomato sauce', 'Ground beef', 'Onion', 'Garlic'],
    'Chicken breast': ['Chicken breast', 'Olive oil', 'Salt', 'Pepper'],
    'Salad': ['Lettuce', 'Tomatoes', 'Cucumber', 'Dressing'],
    'Sandwich': ['Bread', 'Deli meat', 'Cheese', 'Lettuce', 'Mayo'],
    'Eggs and toast': ['Eggs', 'Bread', 'Butter'],
    'Oatmeal': ['Oats', 'Milk', 'Brown sugar', 'Berries'],
    'Smoothie': ['Banana', 'Berries', 'Yogurt', 'Milk', 'Honey']
  }
  
  meals.forEach(meal => {
    const ingredients = ingredientMap[meal.mealName] || []
    ingredients.forEach(ingredient => {
      // Check if ingredient already exists
      const existingItem = groceryItems.find(item => 
        item.text.toLowerCase() === ingredient.toLowerCase()
      )
      
      if (!existingItem) {
        groceryItems.push(createNewListItem(
          ingredient,
          `${meal.mealName} - ${meal.day}`,
          'produce'
        ))
      }
    })
  })
  
  return groceryItems
}

// Get list type color classes for styling
export const getListTypeColorClasses = (listType: CustomListType) => {
  const config = getListTypeConfig(listType)
  
  return {
    bg: `bg-${config.color}-50 dark:bg-${config.color}-900/20`,
    border: `border-${config.color}-200 dark:border-${config.color}-700`,
    text: `text-${config.color}-600 dark:text-${config.color}-400`,
    button: `bg-${config.color}-600 hover:bg-${config.color}-700`,
    accent: `bg-${config.color}-100 dark:bg-${config.color}-900/20`
  }
}

// Filter lists by type
export const filterListsByType = (lists: CustomList[], listType: CustomListType): CustomList[] => {
  return lists.filter(list => list.listType === listType)
}

// Get list statistics
export const getListStats = (list: CustomList) => {
  const totalItems = list.items.length
  const completedItems = list.items.filter(item => item.completed).length
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  
  return {
    totalItems,
    completedItems,
    completionPercentage
  }
}

// Sort lists by creation date (newest first)
export const sortListsByDate = (lists: CustomList[]): CustomList[] => {
  return [...lists].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// Get day names for meal planning
export const getDayNames = (): DayName[] => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
}

// Get meal types
export const getMealTypes = () => {
  return ['breakfast', 'lunch', 'dinner', 'snack'] as const
}
