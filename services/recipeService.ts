import axios from 'axios';
import { SPOONACULAR_API_KEY, API_CONFIG } from '../config';

const spoonacularApi = axios.create({
  baseURL: API_CONFIG.spoonacular.baseUrl,
  params: {
    apiKey: SPOONACULAR_API_KEY,
  },
});

interface AnalyzedStep {
  number: number;
  step: string;
  ingredients: {
    id: number;
    name: string;
    image: string;
  }[];
  equipment: {
    id: number;
    name: string;
    image: string;
  }[];
  length?: {
    number: number;
    unit: string;
  };
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  instructions: string;
  analyzedInstructions: {
    name: string;
    steps: AnalyzedStep[];
  }[];
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    image: string;
  }[];
}

export const getRandomRecipes = async (number: number = 10): Promise<Recipe[]> => {
  try {
    const response = await spoonacularApi.get(API_CONFIG.spoonacular.endpoints.randomRecipes, {
      params: { 
        number,
        addRecipeInformation: true,
        instructionsRequired: true,
      },
    });
    return response.data.recipes;
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    throw error;
  }
};

export const searchRecipes = async (query: string, number: number = 5): Promise<Recipe[]> => {
  try {
    const response = await spoonacularApi.get(API_CONFIG.spoonacular.endpoints.searchRecipes, {
      params: { 
        query,
        number,
        instructionsRequired: true,
        addRecipeInformation: true,
        fillIngredients: true,
      },
    });

    return response.data.results.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      summary: recipe.summary,
      instructions: recipe.instructions,
      analyzedInstructions: recipe.analyzedInstructions || [],
      extendedIngredients: recipe.extendedIngredients || [],
    }));
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

export const searchRecipesWithIngredients = async (ingredients: string[]): Promise<Recipe[]> => {
  try {
    // Search for recipes containing each ingredient individually
    const searchPromises = ingredients.map(ingredient => 
      searchRecipes(ingredient, 5)
    );
    
    const results = await Promise.all(searchPromises);
    const allRecipes = results.flat();
    
    // Get unique recipes by ID
    const uniqueRecipes = Array.from(new Map(
      allRecipes.map(recipe => [recipe.id, recipe])
    ).values());
    
    return uniqueRecipes;
  } catch (error) {
    console.error('Error searching recipes with ingredients:', error);
    throw error;
  }
};

export const getRecipeInformation = async (id: number): Promise<Recipe> => {
  try {
    const endpoint = API_CONFIG.spoonacular.endpoints.recipeInformation.replace('{id}', id.toString());
    const response = await spoonacularApi.get(endpoint, {
      params: {
        instructionsRequired: true,
        addRecipeInformation: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe information:', error);
    throw error;
  }
}; 