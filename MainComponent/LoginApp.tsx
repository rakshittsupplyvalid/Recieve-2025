import React, { useEffect } from 'react';
import { View, Text, PermissionsAndroid, Platform } from 'react-native';
import RNSimData from 'react-native-sim-data';

const SimInfoComponent = () => {
  useEffect(() => {
    const fetchSimInfo = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const simInfo = RNSimData.getSimInfo();
          console.log('SIM Info:', simInfo);
        } else {
          console.log('Permission denied');
        }
      }
    };

    fetchSimInfo();
  }, []);

  return (
    <View>
      <Text>Check logs for SIM Info</Text>
    </View>
  );
};

export default SimInfoComponent;
