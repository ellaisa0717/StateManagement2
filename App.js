import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

// Floating Emoji Component
const FloatingEmoji = ({ emoji, index }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(Math.random() * (width - 50))).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height);
      Animated.timing(translateY, {
        toValue: -100,
        duration: 15000 + Math.random() * 10000,
        useNativeDriver: true,
        delay: index * 1000,
      }).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ translateY }, { translateX }],
        opacity: 0.2,
      }}
    >
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
    </Animated.View>
  );
};

// Global state management
const RecipeContext = React.createContext();

// Add Recipe Screen
function AddRecipeScreen() {
  const { recipes, setRecipes } = React.useContext(RecipeContext);
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const floatingEmojis = ['🍳', '🥘', '🍲', '🥗', '🍝', '🥙', '🍕', '🥐'];

  const clearForm = () => {
    setTitle('');
    setIngredients('');
    setInstructions('');
    setEditingRecipeId(null);
  };

  const handleSaveRecipe = () => {
    if (title.trim().length === 0) {
      Alert.alert('Hold on!', 'Recipe title cannot be empty.');
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (editingRecipeId) {
      setRecipes(
        recipes.map((recipe) =>
          recipe.id === editingRecipeId
            ? { ...recipe, title, ingredients, instructions }
            : recipe
        )
      );
      Alert.alert('Success', 'Recipe updated!');
    } else {
      const newRecipe = {
        id: Date.now().toString(),
        title: title,
        ingredients: ingredients,
        instructions: instructions,
      };
      setRecipes([newRecipe, ...recipes]);
      Alert.alert('Success', 'New recipe added!');
    }

    clearForm();
  };

  useEffect(() => {
    // Check if we need to edit a recipe from My Recipes tab
    const recipeToEdit = recipes.find(r => r.shouldEdit);
    if (recipeToEdit) {
      setTitle(recipeToEdit.title);
      setIngredients(recipeToEdit.ingredients);
      setInstructions(recipeToEdit.instructions);
      setEditingRecipeId(recipeToEdit.id);
      // Clear the shouldEdit flag
      setRecipes(recipes.map(r => ({ ...r, shouldEdit: false })));
    }
  }, [recipes]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Floating Emojis */}
      {floatingEmojis.map((emoji, index) => (
        <FloatingEmoji key={index} emoji={emoji} index={index} />
      ))}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Ionicons name="nutrition" size={24} color="#FF6347" />
              <Text style={styles.formSectionTitle}>
                {editingRecipeId ? 'Edit Recipe' : 'Add New Recipe'}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Recipe Title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ingredients (e.g., 2 eggs, 1 cup flour...)"
              placeholderTextColor="#999"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Instructions..."
              placeholderTextColor="#999"
              value={instructions}
              onChangeText={setInstructions}
              multiline
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRecipe}
              activeOpacity={0.8}
            >
              <Ionicons
                name={editingRecipeId ? "save-outline" : "add-circle-outline"}
                size={24}
                color="#fff"
              />
              <Text style={styles.saveButtonText}>
                {editingRecipeId ? 'Update Recipe' : 'Add Recipe'}
              </Text>
            </TouchableOpacity>
            {editingRecipeId && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={clearForm}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={20} color="#6c757d" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// My Recipes Screen
function MyRecipesScreen({ navigation }) {
  const { recipes, setRecipes } = React.useContext(RecipeContext);
  const [menuVisible, setMenuVisible] = useState(false);

  const floatingEmojis = ['🍳', '🥘', '🍲', '🥗', '🍝', '🥙', '🍕', '🥐'];

  const handleEditRecipe = (recipe) => {
    // Mark recipe for editing and switch to Add Recipe tab
    setRecipes(recipes.map(r => 
      r.id === recipe.id ? { ...r, shouldEdit: true } : r
    ));
    navigation.navigate('AddRecipe');
  };

  const handleDeleteRecipe = (id) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setRecipes(recipes.filter((recipe) => recipe.id !== id));
            Alert.alert('Deleted', 'Recipe has been removed!');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Recipes',
      'Are you sure you want to delete ALL recipes? This cannot be undone!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setRecipes([]);
            setMenuVisible(false);
            Alert.alert('Success', 'All recipes deleted!');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeCard}>
      <Text style={styles.recipeCardTitle}>{item.title}</Text>

      <View style={styles.recipeDetailRow}>
        <Text style={styles.emojiIcon}>🥘</Text>
        <Text style={styles.recipeCardSubtitle}>Ingredients:</Text>
      </View>
      <Text style={styles.recipeCardText}>{item.ingredients}</Text>

      <View style={styles.recipeDetailRow}>
        <Text style={styles.emojiIcon}>👨‍🍳</Text>
        <Text style={styles.recipeCardSubtitle}>Instructions:</Text>
      </View>
      <Text style={styles.recipeCardText}>{item.instructions}</Text>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditRecipe(item)}>
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRecipe(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Floating Emojis */}
      {floatingEmojis.map((emoji, index) => (
        <FloatingEmoji key={index} emoji={emoji} index={index} />
      ))}

      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="menu" size={28} color="#FF6347" />
      </TouchableOpacity>

      {/* Recipe Count Badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{recipes.length} Recipe{recipes.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={styles.emptyText}>No recipes yet! Start cooking!</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('AddRecipe')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addFirstButtonText}>Add Your First Recipe</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Side Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.sideMenu}>
            <View style={styles.menuHeader}>
              <Ionicons name="restaurant" size={32} color="#FF6347" />
              <Text style={styles.menuTitle}>Menu</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('AddRecipe');
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Add Recipe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Ionicons name="book-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>My Recipes ({recipes.length})</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert(
                  'Recipe Book',
                  `Version 1.0\n\nTotal Recipes: ${recipes.length}\n\nMade with ❤️`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Ionicons name="information-circle-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>About</Text>
            </TouchableOpacity>

            {recipes.length > 0 && (
              <TouchableOpacity
                style={[styles.menuItem, styles.dangerMenuItem]}
                onPress={handleDeleteAll}
              >
                <Ionicons name="trash-bin-outline" size={24} color="#dc3545" />
                <Text style={[styles.menuItemText, styles.dangerText]}>Delete All Recipes</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeMenuButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeMenuText}>Close Menu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Main App Component
export default function App() {
  const [recipes, setRecipes] = useState([]);

  return (
    <RecipeContext.Provider value={{ recipes, setRecipes }}>
      <NavigationContainer>
        <View style={styles.appContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="restaurant" size={36} color="#fff" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Recipe Book</Text>
            </View>
            <Text style={styles.headerSubtitle}>Cook, Create, Celebrate</Text>
          </View>

          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'AddRecipe') {
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                } else if (route.name === 'MyRecipes') {
                  iconName = focused ? 'book' : 'book-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#FF6347',
              tabBarInactiveTintColor: '#888',
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopWidth: 0,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
              },
            })}
          >
            <Tab.Screen
              name="AddRecipe"
              component={AddRecipeScreen}
              options={{ tabBarLabel: 'Add Recipe' }}
            />
            <Tab.Screen
              name="MyRecipes"
              component={MyRecipesScreen}
              options={{ tabBarLabel: 'My Recipes' }}
            />
          </Tab.Navigator>
        </View>
      </NavigationContainer>
    </RecipeContext.Provider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  header: {
    backgroundColor: '#FF6347',
    paddingTop: Constants.statusBarHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFE4E1',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingVertical: 20,
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 80,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 15,
    borderRadius: 25,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100,
  },
  countBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#FF6347',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: '#FF6347',
  },
  recipeCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 15,
  },
  recipeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  emojiIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  recipeCardSubtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#555',
  },
  recipeCardText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
    marginLeft: 30,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 30,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28A745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sideMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FFE4E1',
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 10,
  },
  dangerMenuItem: {
    marginTop: 10,
  },
  dangerText: {
    color: '#dc3545',
  },
  closeMenuButton: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  closeMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
});