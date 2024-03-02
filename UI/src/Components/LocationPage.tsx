import React, {useEffect, useRef, useState} from 'react';
import {
  ToastAndroid,
  Dimensions,
  PermissionsAndroid,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Pressable,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {getLocation} from 'react-native-weather-api';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import {theme} from '../utils/theme';
import { GOOGLE_API_KEY, OPENWEATHERMAP_API_KEY } from '../utils/constants';

interface RegionData {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface WeatherData {
  name: string;
  country: string;
  temp: number;
  temp_min: number;
  temp_max: number;
  feels_like: number;
  wind: number;
  pressure: number;
  humidity: number;
  description: string;
  icon: string;
}

const LocationPage = (props: any) => {
  const [region, setRegion] = useState<RegionData | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // **Added dummy data**
  // const data = props.route.params
  const data = {
    numOfMeals: '3', 
    calories: 1200, 
    restrictions: [], 
    heartRate: 68, 
    age: '24'
  }

  const mapRef = useRef<MapView | null>(null);
  const placesAutocompleteRef = useRef<GooglePlacesAutocompleteRef | null>(
    null,
  );

  const fetchLocationDetails = (lat = 25, lon = 25) => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_API_KEY}`,
    )
      .then(res => res.json())
      .then(json => {
        setRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setAddress(json.results[0].formatted_address);
        return json.results[0].formatted_address;
      });
  };

  const enableLocation = async () => {
    try {
      const enableResult = await promptForEnableLocationIfNeeded();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        // The user has not accepted to enable the location services or something went wrong during the process
        // "err" : { "code" : "ERR00|ERR01|ERR02|ERR03", "message" : "message"}
        // codes :
        //  - ERR00 : The user has clicked on Cancel button in the popup
        //  - ERR01 : If the Settings change are unavailable
        //  - ERR02 : If the popup has failed to open
        //  - ERR03 : Internal error
      }
    }
  };

  const getWeatherData = (lat = 25, lon = 25) => {
    fetch(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`,
    )
      .then(res => res.json())
      .then(json => {
        return setWeatherData({
          name: json.name,
          country: json.sys.country,
          temp: json.main.temp,
          temp_min: json.main.temp_min,
          temp_max: json.main.temp_max,
          feels_like: json.main.feels_like,
          wind: json.wind.speed,
          pressure: json.main.pressure,
          humidity: json.main.humidity,
          description: json.weather[0].description,
          icon: json.weather[0].icon,
        });
      });
  };

  const getCurrentLocation = () => {
    getLocation()
      .then((position: any) => {
        fetchLocationDetails(
          position.coords.latitude,
          position.coords.longitude,
        );
        getWeatherData(position.coords.latitude, position.coords.longitude);
      })
      .catch((err: any) => {
        console.log(err, err.code);
      });
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await enableLocation();
        getCurrentLocation();
      } else {
        ToastAndroid.showWithGravity(
          'Failure in getting location access',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
    } catch (err) {
      ToastAndroid.showWithGravity(
        'Failure in getting location access',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }
  };

  const handleNextPress = async () => {
    const winterSeasonWeatherDesc = ['snow', 'mist'];
    const monsoonSeasonWeatherDesc = [
      'shower rain',
      'rain',
      'thunderstorm',
      'broken clouds',
    ];
    let season = 'Summer';
    if (
      weatherData?.description &&
      weatherData?.description in winterSeasonWeatherDesc
    ) {
      season = 'Winter';
    } else if (
      weatherData?.description &&
      weatherData?.description in monsoonSeasonWeatherDesc
    ) {
      season = 'Rain';
    }
    let restrictions: any = data.restrictions || []
    let age = (data.age && parseInt(data.age)) || 60
    // Added heart rate logic for low-sodium restriction
    let normalHeartRate = 60 + 0.6 * age
    if (data.heartRate && (data.heartRate < normalHeartRate*0.9 || data.heartRate > normalHeartRate*1.1)) {
      restrictions.push('low-sodium')
    }
    let request = {
      noOfMeals: data.numOfMeals ? parseInt(data.numOfMeals) : 1,
      location: address,
      season,
      restrictions,
      calories: data.calories || []
    }
    props.navigation.navigate('Meal', {request, region})
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (placesAutocompleteRef.current && address) {
      placesAutocompleteRef.current.setAddressText(address);
    }
  }, [address]);

  if (region) {
    return (
      <View style={styles.container}>
        <GooglePlacesAutocomplete
          ref={placesAutocompleteRef}
          placeholder="Change Address"
          textInputProps={{
            placeholderTextColor: '#454545',
          }}
          fetchDetails={true}
          onPress={(data, details: any = null) => {
            if (details?.geometry) {
              setRegion({
                latitude: details?.geometry.location.lat,
                longitude: details?.geometry.location.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              });
              getWeatherData(
                details?.geometry.location.lat,
                details?.geometry.location.lng,
              );

              if (mapRef.current) {
                mapRef.current.fitToCoordinates(
                  [
                    {
                      latitude: details?.geometry.location.lat,
                      longitude: details?.geometry.location.lng,
                    },
                  ],
                  {
                    edgePadding: {
                      top: 20,
                      right: 20,
                      bottom: 20,
                      left: 20,
                    },
                    animated: true,
                  },
                );
              }
            }
          }}
          query={{
            key: 'AIzaSyCwnn5Id36wZ5900p2UeEYd9MuYBxCUlXY',
            language: 'en',
          }}
          currentLocation={true}
          currentLocationLabel="Current location"
          renderRow={(rowData: any) => {
            const title = rowData.structured_formatting.main_text;
            const address = rowData.structured_formatting.secondary_text;
            return (
              <View>
                <Text style={{fontSize: 14, color: '#454545'}}>
                  {title + ', ' + address}
                </Text>
              </View>
            );
          }}
          styles={{
            textInput: {
              height: 38,
              color: '#5d5d5d',
              fontSize: 16,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
            container: styles.autocompleteContainer,
            listView: styles.listView,
            separator: styles.separator,
          }}
        />

        <MapView ref={mapRef} style={styles.map} initialRegion={region}>
          <Marker
            coordinate={region}
            title={weatherData?.name}
            description={
              weatherData?.temp
                ? `Temperature: ${Math.round(weatherData?.temp || 0)} °C`
                : undefined
            }
          />
        </MapView>

        <View style={styles.itemDiv}>
          <Pressable
            onPress={handleNextPress}
            style={{
              ...styles.nextBtn,
              backgroundColor: theme.primaryColor,
            }}>
            <Text style={{color: 'white'}}>Suggest Diet Plan</Text>
          </Pressable>
        </View>
      </View>
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
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  itemDiv: {
    width: '80%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    color: '#000',
  },
  nextBtn: {
    borderRadius: 20,
    backgroundColor: theme.primaryColor,
    padding: 10,
    marginTop: 10,
    width: '50%',
    display: 'flex',
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  listView: {
    backgroundColor: 'white',
    color: '#5d5d5d',
  },
  renderRow: {
    color: '#5d5d5d',
    backgroundColor: '#e0e0e0',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LocationPage;
