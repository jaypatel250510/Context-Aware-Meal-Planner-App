import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import {theme} from '../utils/theme';
import MapView, {Marker, Polyline} from 'react-native-maps';
import axios from 'axios';
import { GOOGLE_API_KEY } from '../utils/constants';
import { getDietPlan } from '../utils/getDietPlan';

const MealPage = (props: any) => {
	const [recipes, setRecipes] = useState<any>([]);
	const [mapModalVisible, setMapModalVisible] = useState<any>(false)
	const [pathCoordinates, setPathCoordinates] = useState([]);
	const [groceryShops, setGroceryShops] = useState([]);
  const [modalVisible, setModalVisible] = useState<any>(false);
  const [recipeDetail, setRecipeDetail] = useState<any>(null);
	const data = props.route.params
	const { region, request } = data

	useEffect(() => {

		const getNearbyGroceryShops = async () => {
      try {
        const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=5000&type=grocery_or_supermarket&key=${GOOGLE_API_KEY}`,
        );
        const result = await response.json();
        console.log('shops fetched');
        setGroceryShops(result.results);
      } catch (error) {
        console.error('Error fetching nearby grocery shops:', error);
      }
		};

    const fetchData = async () => {
      let plan = await getDietPlan(request);
      setRecipes(plan?.data);
    };
    fetchData();

		getNearbyGroceryShops();
	}, []);

	const handleMarkerPress = async (shop: any) => {
		try {
		const response = await axios.get(
			`https://maps.googleapis.com/maps/api/directions/json?origin=${region.latitude},${region.longitude}&destination=${shop.geometry.location.lat},${shop.geometry.location.lng}&key=${GOOGLE_API_KEY}`,
		);

		const {routes} = response.data;

		if (routes.length > 0) {
			const {legs} = routes[0];
			const steps = legs.reduce(
			(acc: any, leg: any) => [...acc, ...leg.steps],
			[],
			);
			const coordinates = steps.map((step: any) => ({
			latitude: step.start_location.lat,
			longitude: step.start_location.lng,
			}));
			setPathCoordinates(coordinates);
		}
		} catch (error) {
		console.error('Error fetching path coordinates:', error);
		}
	};

  if (recipes) {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerDiv}>
          <Text style={styles.header}>Meal Plan</Text>
          <Text style={{color: '#000'}}>Let's Get Healthy!</Text>
        </View>
        <View style={styles.headerDiv}>
          {recipes.map((recipe: any) => {
            return (
              <View style={styles.listContainer}>
                <Text style={styles.item}>{recipe.recipe.label}</Text>
                <Pressable
                  onPress={() => {
                    setModalVisible(true);
                    setRecipeDetail(recipe);
                  }}
                  style={styles.moreBtn}>
                  <Text style={{color: 'white'}}>More</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={() => {
            setMapModalVisible(true);
          }}
          style={styles.moreBtn}>
          <Text style={{color: 'white'}}>Show Near By Shops</Text>
        </Pressable>

        {mapModalVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={mapModalVisible}
            onRequestClose={() => {
              setMapModalVisible(!mapModalVisible);
            }}>
            <View style={styles.container}>
              <MapView style={styles.map} region={region}>
                <Marker
                  coordinate={region}
                  pinColor="blue"
                  // title={shop.name}
                  // description={shop.vicinity}
                />
                {groceryShops.map((shop: any) => (
                  <Marker
                    key={shop.place_id}
                    coordinate={{
                      latitude: shop.geometry.location.lat,
                      longitude: shop.geometry.location.lng,
                    }}
                    title={shop.name}
                    description={shop.vicinity}
                    onPress={() => handleMarkerPress(shop)}
                  />
                ))}

                {pathCoordinates.length > 0 && (
                  <Polyline
                    coordinates={pathCoordinates}
                    strokeColor="#3498db" // Change the line color
                    strokeWidth={3}
                  />
                )}
              </MapView>
              <Pressable
                style={[styles.button, {margin: 10}]}
                onPress={() => setMapModalVisible(!mapModalVisible)}>
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
            </View>
          </Modal>
        )}

        {recipeDetail && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <ScrollView>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalTextTitle}>CALORIES</Text>
                  <Text style={styles.modalText}>
                    {recipeDetail?.recipe?.calories &&
                      recipeDetail?.recipe?.calories.toFixed(2)}{' '}
                    kcal
                  </Text>
                  <Text style={styles.modalTextTitle}>INGREDIENTS</Text>
                  {recipeDetail?.recipe?.ingredientLines.map((ingr: any) => (
                    <Text style={styles.modalText}>• {ingr}</Text>
                  ))}
                  <Text
                    style={[styles.modalTextTitle, {color: 'blue'}]}
                    onPress={() => Linking.openURL(recipeDetail?.recipe?.url)}>
                    RECIPE
                  </Text>
                  <Text style={styles.modalTextTitle}>NUTRIENTS</Text>
                  <View style={styles.table}>
                    {Object.keys(recipeDetail?.recipe?.totalNutrients).map(
                      (nutrient: any) => (
                        <View style={styles.row}>
                          <View style={[styles.cell, {borderRightWidth: 1}]}>
                            <Text style={{color: 'black'}}>
                              {
                                recipeDetail?.recipe?.totalNutrients[nutrient]
                                  .label
                              }
                            </Text>
                          </View>
                          <View style={styles.cell}>
                            <Text style={{color: 'black'}}>
                              {recipeDetail?.recipe?.totalNutrients[
                                nutrient
                              ].quantity.toFixed(2) +
                                ' ' +
                                recipeDetail?.recipe?.totalNutrients[nutrient]
                                  .unit}
                            </Text>
                          </View>
                        </View>
                      ),
                    )}
                  </View>
                  <Pressable
                    style={styles.button}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={styles.textStyle}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </Modal>
        )}
      </ScrollView>
    );
  }
  return (
    <View style={[styles.container, styles.horizontal]}>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1, //the container will fill the whole screen.
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: theme.primaryColor,
    width: '100%',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
  },
  modalTextTitle: {
    textAlign: 'center',
    color: 'black',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  listContainer: {
    backgroundColor: theme.appBackground,
    width: '90%',
    marginVertical: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  headerDiv: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    color: '#000',
  },
  moreBtn: {
    backgroundColor: theme.primaryColor,
    borderRadius: 20,
    padding: 10,
    margin: 10,
    flex: 0.2,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  item: {
    padding: 20,
    fontSize: 15,
    marginTop: 5,
    color: '#000',
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  cell: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MealPage;
