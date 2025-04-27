import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Recipe, getRecipeInformation } from '../services/recipeService';

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { recipe: recipeParam } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        let recipeData: Recipe;

        if (typeof recipeParam === 'string') {
          // If we have a full recipe object in params
          recipeData = JSON.parse(recipeParam);
          
          // If the recipe doesn't have analyzed instructions, fetch the full details
          if (!recipeData.analyzedInstructions || recipeData.analyzedInstructions.length === 0) {
            recipeData = await getRecipeInformation(recipeData.id);
          }
        } else {
          throw new Error('Invalid recipe data');
        }

        setRecipe(recipeData);
        setError(null);
        checkIfFavorite(recipeData.id);
      } catch (err) {
        console.error('Error loading recipe:', err);
        setError('Failed to load recipe details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeParam]);

  const checkIfFavorite = async (recipeId: number) => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        setIsFavorite(favorites.some((fav: Recipe) => fav.id === recipeId));
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!recipe) return;

    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let favorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (isFavorite) {
        favorites = favorites.filter(fav => fav.id !== recipe.id);
      } else {
        favorites.push(recipe);
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get unique equipment from all steps
  const allEquipment = new Set(
    recipe.analyzedInstructions
      ?.flatMap(instruction => instruction.steps)
      .flatMap(step => step.equipment)
      .map(equipment => equipment.name)
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.favoriteButton} 
        onPress={toggleFavorite}
      >
        <FontAwesome 
          name={isFavorite ? "heart" : "heart-o"} 
          size={24} 
          color={isFavorite ? "#FF8C00" : "#fff"} 
        />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {recipe.image && (
          <Image 
            source={{ uri: recipe.image }} 
            style={styles.recipeImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.contentContainer}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{recipe.title || 'Untitled Recipe'}</Text>
            <View style={styles.recipeMetaInfo}>
              <Text style={styles.metaText}>⏱️ {recipe.readyInMinutes || '?'} minutes</Text>
              <Text style={styles.metaText}>👥 {recipe.servings || '?'} servings</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients Needed</Text>
            {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
              recipe.extendedIngredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.ingredientText}>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No ingredients available</Text>
            )}
          </View>

          {allEquipment.size > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
              {Array.from(allEquipment).map((equipment, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.ingredientText}>{equipment}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.analyzedInstructions?.length > 0 ? (
              recipe.analyzedInstructions[0].steps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>Step {step.number}</Text>
                  <Text style={styles.stepText}>{step.step}</Text>
                  
                  {step.ingredients?.length > 0 && (
                    <View style={styles.stepDetails}>
                      <Text style={styles.stepDetailsTitle}>Ingredients for this step:</Text>
                      <Text style={styles.stepDetailsText}>
                        {step.ingredients.map(ing => ing.name).join(', ')}
                      </Text>
                    </View>
                  )}
                  
                  {step.equipment?.length > 0 && (
                    <View style={styles.stepDetails}>
                      <Text style={styles.stepDetailsTitle}>Equipment needed:</Text>
                      <Text style={styles.stepDetailsText}>
                        {step.equipment.map(eq => eq.name).join(', ')}
                      </Text>
                    </View>
                  )}

                  {step.length && (
                    <Text style={styles.stepTiming}>
                      ⏱️ {step.length.number} {step.length.unit}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No instructions available</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 24,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 20,
  },
  recipeHeader: {
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeMetaInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 15,
  },
  metaText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    color: '#FF8C00',
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  stepContainer: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  stepDetails: {
    marginTop: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  stepDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  stepDetailsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  stepTiming: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  favoriteButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
}); 