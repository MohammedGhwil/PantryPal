import React from 'react';
import { Modal, StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Recipe } from '../services/recipeService';

interface RecipeDetailsModalProps {
  recipe: Recipe | null;
  visible: boolean;
  onClose: () => void;
}

export default function RecipeDetailsModal({ recipe, visible, onClose }: RecipeDetailsModalProps) {
  if (!recipe) return null;

  // Get unique equipment from all steps
  const allEquipment = new Set(
    recipe.analyzedInstructions
      ?.flatMap(instruction => instruction.steps)
      .flatMap(step => step.equipment)
      .map(equipment => equipment.name)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
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
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
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
    color: '#4CAF50',
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
    color: '#4CAF50',
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  instructions: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
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
    color: '#4CAF50',
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
}); 