import React, {useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import * as Progress from 'react-native-progress';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {RNCamera} from 'react-native-camera';
import {getHeartRate} from '../utils/getHeartRate';

const Camera = ({navigation}: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  let heartRate = '';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  let cameraRef: any = useRef(null);

  const height = Dimensions.get('window').height;

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      try {
        const options = {
          quality: RNCamera.Constants.VideoQuality['720p'],
          maxDuration: 45,
        };
        const data = await cameraRef.current.recordAsync(options);
        stopRecording();
        setCalculating(true);
        let res = await getHeartRate(data.uri);
        heartRate = res?.data;
        setCalculating(false);
        showAlert();
      } catch (error) {
        stopRecording();
        setCalculating(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      setIsRecording(false);
      cameraRef.current.stopRecording();
    }
  };

  const showAlert = () =>
    Alert.alert('Heart Rate', `Your calculated heart is ${heartRate} bpm`, [
      {
        text: 'Cancel',
        onPress: () => (heartRate = ''),
        style: 'cancel',
      },
      {
        text: 'Done',
        onPress: () => {
          navigation.navigate('Home', {
            updatedHeartRate: heartRate,
          });
        },
      },
    ]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            height: height,
          }}>
          <RNCamera
            ref={cameraRef}
            captureAudio={false}
            playSoundOnRecord={false}
            style={{height: height}}
            type={RNCamera.Constants.Type.back}
            flashMode={
              isRecording
                ? RNCamera.Constants.FlashMode.torch
                : RNCamera.Constants.FlashMode.off
            }
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}>
            {calculating ? (
              <View
                style={{
                  backgroundColor: '#ffffff90',
                  height: height,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Progress.Circle indeterminate={true} />
              </View>
            ) : (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  backgroundColor: '#00000050',
                  display: 'flex',
                  flexDirection: 'row',
                  right: 0,
                  left: 0,
                  justifyContent: 'center',
                }}>
                {!isRecording ? (
                  <TouchableOpacity
                    onPress={startRecording}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 50,
                      width: 60,
                      height: 60,
                      padding: 15,
                      alignSelf: 'center',
                      margin: 20,
                    }}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={stopRecording}
                    style={{
                      backgroundColor: 'red',
                      borderRadius: 50,
                      width: 60,
                      height: 60,
                      padding: 15,
                      alignSelf: 'center',
                      margin: 20,
                    }}
                  />
                )}
              </View>
            )}
          </RNCamera>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Camera;
