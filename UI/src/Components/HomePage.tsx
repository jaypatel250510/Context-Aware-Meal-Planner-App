import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  View,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {theme} from '../utils/theme';
import {uploadHealthProfile} from '../utils/uploadHealthProfile';
import {
  activityLevelOptions,
  allergyRestrictionsOptions,
  dietaryRestrictionsOptions,
} from '../utils/constants';

const HomePage = ({route, navigation}: any) => {
  const [heartRate, setHeartRate] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState('');
  const [dietaryTags, setDietaryTags] = useState<Array<string>>([]);
  const [allergyTags, setAllergyTags] = useState<Array<string>>([]);
  const [activityLevel, setActivityLevel] = useState('');
  const [numOfMeals, setNumOfMeals] = useState('');
  const [bmi, setBmi] = useState<string>();
  const [disableNext, setDisableNext] = useState(true);
  const [dietRestOptions, setDietRestOptions] = useState(
    dietaryRestrictionsOptions,
  );
  const [allergyRestOptions, setAllergyRestOptions] = useState(
    allergyRestrictionsOptions,
  );

  useEffect(() => {
    validateData();
  }, [heartRate, age, height, weight, gender, activityLevel, numOfMeals]);

  useEffect(() => {
    if (height && weight) {
      calculateAndSetBMI();
    }
  }, [height, weight]);

  useEffect(() => {
    if (route.params?.updatedHeartRate) {
      setHeartRate(route.params?.updatedHeartRate);
    }
  }, [route.params?.updatedHeartRate]);

  const calculateAndSetBMI = () => {
    let heightInMeters = parseInt(height) / 100;
    let bmiValue = parseInt(weight) / (heightInMeters * heightInMeters);
    setBmi(bmiValue.toFixed(2));
  };

  const handleHeartRatePress = () => {
    navigation.navigate('Camera');
  };

  const validateData = () => {
    if (
      heartRate &&
      age &&
      height &&
      weight &&
      gender &&
      activityLevel &&
      numOfMeals
    ) {
      setDisableNext(false);
    } else {
      setDisableNext(true);
    }
  };

  const handleNextPress = async () => {
    const res = await uploadHealthProfile({
      userId: 1,
      heartRate,
      age,
      height,
      weight,
      gender,
      dietaryTags,
      allergyTags,
      activityLevel,
      numOfMeals,
      bmi,
    });
    let calories = 0;
    if (gender == 'female') {
      calories =
        447.593 +
        9.247 * parseFloat(weight) +
        3.098 * parseFloat(height) -
        4.33 * parseInt(age);
    } else {
      calories =
        88.362 +
        13.397 * parseFloat(weight) +
        4.799 * parseFloat(height) -
        5.677 * parseInt(age);
    }

    if (activityLevel == 'sedentary') {
      calories *= 1.2;
    } else if (activityLevel == 'light') {
      calories *= 1.375;
    } else if (activityLevel == 'moderate') {
      calories *= 1.55;
    } else if (activityLevel == 'veryActive') {
      calories *= 1.725;
    } else {
      calories *= 1.9;
    }
    let restrictions: any = [];
    dietaryTags.forEach(tag => {
      restrictions.push(tag.split(' ').join('-').toLowerCase());
    });
    allergyTags.forEach(tag => {
      restrictions.push(tag.split(' ').join('-').toLowerCase());
    });
    navigation.navigate('Location', {
      numOfMeals,
      calories,
      restrictions,
      heartRate,
      age,
    });
  };

  const removeTag = (type: any, index: any) => {
    if (type === 'dietary') {
      let update = dietaryTags.filter((_, idx) => idx !== index);
      setDietaryTags(update);
      let temp = dietaryRestrictionsOptions.filter(function (item) {
        return !update.includes(item.label);
      });
      setDietRestOptions(temp);
    } else {
      let update = allergyTags.filter((_, idx) => idx !== index);
      setAllergyTags(update);
      let temp = allergyRestrictionsOptions.filter(function (item) {
        return !update.includes(item.label);
      });
      setAllergyRestOptions(temp);
    }
  };

  const ageOptions = [];
  for (let i = 10; i <= 100; i++) {
    ageOptions.push(<Picker.Item key={i} label={`${i}`} value={`${i}`} />);
  }

  const updateDietaryTags = (item: any, idx: any) => {
    let temp = dietRestOptions.filter(i => i.label != item);
    let val = dietRestOptions[idx]['label'];
    setDietRestOptions(temp);
    setDietaryTags([...dietaryTags, val]);
  };

  const updateAllergyTags = (item: any, idx: any) => {
    let temp = allergyRestOptions.filter(i => i.label != item);
    let val = allergyRestOptions[idx]['label'];
    setAllergyRestOptions(temp);
    setAllergyTags([...allergyTags, val]);
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerDiv}>
        <Text style={styles.header}>Welcome</Text>
        <Text style={{color: '#000'}}>
          Let's get started with your Health Profile
        </Text>
      </View>

      <View style={styles.itemDiv}>
        <Text style={styles.label}>Height (cm):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Height"
          onChangeText={setHeight}
          value={height}
          keyboardType="numeric"
          placeholderTextColor="#000"
        />
      </View>

      <View style={styles.itemDiv}>
        <Text style={styles.label}>Weight (kg):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Weight"
          onChangeText={setWeight}
          value={weight}
          keyboardType="numeric"
          placeholderTextColor="#000"
        />
      </View>

      {bmi && <Text style={styles.bmiText}>Your BMI: {bmi}</Text>}

      <View style={styles.itemDiv}>
        <Text style={styles.label}>Activity Level:</Text>
        <Picker
          selectedValue={activityLevel}
          dropdownIconColor="#000"
          onValueChange={itemValue => setActivityLevel(itemValue)}
          style={styles.picker}>
          {activityLevelOptions.map((item, idx) => (
            <Picker.Item label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.itemDiv}>
        <Text style={styles.label}>Number of Meals per Day:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Number of Meals"
          onChangeText={setNumOfMeals}
          value={numOfMeals}
          placeholderTextColor="#000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.itemDiv}>
        <Text style={styles.label}>Gender:</Text>
        <Picker
          selectedValue={gender}
          dropdownIconColor="#000"
          onValueChange={itemValue => setGender(itemValue)}
          style={styles.picker}>
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      <View style={styles.itemDiv}>
        <Text style={styles.label}>Age:</Text>
        <Picker
          selectedValue={age}
          dropdownIconColor="#000"
          onValueChange={itemValue => setAge(itemValue)}
          style={styles.picker}>
          <Picker.Item label="Select Age" value="" />
          {ageOptions}
        </Picker>
      </View>

      <View style={{...styles.itemDiv, marginBottom: 0}}>
        <Text style={styles.label}>Dietary Restrictions:</Text>
        <Picker
          style={styles.input}
          dropdownIconColor="#000"
          onValueChange={updateDietaryTags}>
          {dietRestOptions.map(item => (
            <Picker.Item label={item.label} value={item.label} />
          ))}
        </Picker>
      </View>

      <View style={{...styles.itemDiv, marginTop: 0}}>
        <View style={styles.tagContainer}>
          {dietaryTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() => removeTag('dietary', index)}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{...styles.itemDiv, marginBottom: 0}}>
        <Text style={styles.label}>Allergy Restrictions:</Text>
        <Picker
          style={styles.input}
          dropdownIconColor="#000"
          onValueChange={updateAllergyTags}>
          {allergyRestOptions.map(item => (
            <Picker.Item label={item.label} value={item.label} />
          ))}
        </Picker>
      </View>

      <View style={{...styles.itemDiv, marginTop: 0}}>
        <View style={styles.tagContainer}>
          {allergyTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() => removeTag('allergy', index)}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.itemDiv}>
        <Text style={styles.label}>Heart Rate:</Text>
        {heartRate && (
          <Text
            style={{
              padding: 5,
              color: '#000',
            }}>
            Measured Heart Rate: {heartRate} bpm
          </Text>
        )}
        <Pressable onPress={handleHeartRatePress} style={styles.heartRateBtn}>
          <Text style={{color: 'white'}}>Measure Heart Rate</Text>
        </Pressable>
      </View>

      <View style={styles.itemDiv}>
        <Pressable
          onPress={handleNextPress}
          style={{
            ...styles.nextBtn,
            backgroundColor: disableNext ? 'darkgrey' : theme.primaryColor,
          }}
          disabled={disableNext}>
          <Text style={{color: 'white'}}>Next</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerDiv: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    color: '#000',
  },
  itemDiv: {
    width: '80%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    color: '#000',
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  label: {
    alignSelf: 'flex-start',
    padding: 3,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    color: '#000',
  },
  picker: {
    width: '100%',
    color: '#000',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    display: 'flex',
  },
  tag: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.appBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    margin: 5,
  },
  tagText: {
    color: '#000',
  },
  bmiText: {
    fontSize: 18,
    color: theme.secondaryColor,
  },
  heartRateBtn: {
    borderRadius: 20,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.secondaryColor,
    padding: 10,
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
});

export default HomePage;
