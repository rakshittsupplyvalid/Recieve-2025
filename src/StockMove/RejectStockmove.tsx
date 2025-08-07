import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/Type';
import { Dropdown } from 'react-native-element-dropdown';
import apiClient from '../../service/api/apiInterceptors';
import { Ionicons } from '@expo/vector-icons';
import useForm from '../../service/UseForm';


type RouteParams = {
  params: {
    stockMoveId: string;
  };
};

const RejectStockmove: React.FC = () => {
  
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { stockMoveId } = route.params;
  const [rejectStatus, setRejectStatus] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const rejectOptions = [
    { label: 'Select an option', value: null },
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];
 
 const handleReject = async () => {
  if (rejectStatus !== 'yes') {
    Alert.alert('Error', 'Please select Yes to reject the stock move');
    return;
  }

  setIsLoading(true);

  try {
    const payload = {
      isRejected: true,
      chamberQuantity: {
        additionalProp1: 0,
        additionalProp2: 0,
        additionalProp3: 0
      },
      date: new Date().toISOString()
    };

    const response = await apiClient.put(
      `/api/stockmove/${stockMoveId}/castockin`,
      payload
    );

    Alert.alert('Success', 'Stock move rejected successfully');
    navigation.goBack();
  } 

  catch (error) {
  let errorMessage = 'Something went wrong. Please try again later.';

  if (error.response) {
    // The server responded with a status code outside 2xx
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      message : error.response.message
    });

   

  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    errorMessage = 'No response from server. Please check your network.';
  } else {
    // Something else happened
    console.error('Error setting up request:', error.message);
    errorMessage = error.message;
  }

  Alert.alert('Error', errorMessage);
}
  
  
  finally {
    setIsLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>    <Ionicons name="arrow-back" size={26} color="white" /> </Text>
        </TouchableOpacity>
        {/* <Text style={styles.headerText}>Stock Move ID: {stockMoveId}</Text> */}

        <Text style={styles.headerText}>Rejected Stock</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>Do you want to reject this stock move?</Text>
        
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={rejectOptions}
          search={false}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select option' : '...'}
          value={rejectStatus}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setRejectStatus(item.value);
            setIsFocus(false);
          }}
      
        />
        
        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.disabledButton]} 
          onPress={handleReject}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Processing...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F6A001',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 25,
    paddingTop: 30,
  },
  label: {
    fontSize: 17,
    marginBottom: 20,
    color: '#495057',
    fontWeight: '500',
    lineHeight: 24,
  },
  dropdown: {
    height: 56,
    backgroundColor: '#ffffff',
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#6c757d',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#212529',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#212529',
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: '#6c757d',
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#dc3545', // Red color for destructive action
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#e0a8b0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default RejectStockmove;