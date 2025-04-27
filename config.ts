export const SPOONACULAR_API_KEY = '240a16fa3d8d48249f91ff41055642c5';
export const API_URL = 'http://192.168.100.119:5000'; // Using the local IP address

export const API_CONFIG = {
  spoonacular: {
    baseUrl: 'https://api.spoonacular.com',
    endpoints: {
      randomRecipes: '/recipes/random',
      searchRecipes: '/recipes/complexSearch',
      recipeInformation: '/recipes/{id}/information',
    },
  },
  googleVision: {
    baseUrl: 'https://vision.googleapis.com/v1/images:annotate',
  },
}; 