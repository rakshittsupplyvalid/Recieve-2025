import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/Type';
import useForm from '../../service/UseForm';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../service/api/apiInterceptors';

// Types
type RouteParams = {
  params: {
    stockMoveId: string;
  };
};

type HealthReportOption = {
  label: string;
  value: string;
};

type ChamberDetail = {
  id: number;
  caStorageLocation?: string;
  chamberNumber?: string;
  quantity: string;
};

// Constants
const healthReportOptions: HealthReportOption[] = [
  { label: 'Health Report One', value: 'excellent' },
  { label: 'Health Report Two', value: 'good' },
  { label: 'Health Report three', value: 'fair' },
  { label: 'Health Report Four', value: 'poor' },
];

const RecieveStockmove: React.FC = () => {
  // State management using custom useForm hook
  const { state, updateState } = useForm();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { stockMoveId } = route.params;

  const [healthReport, setHealthReport] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receivedDate, setReceivedDate] = useState<Date>(new Date());

  const [chamberDetails, setChamberDetails] = useState<ChamberDetail[]>([{
    id: 1,
    quantity: ''
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized functions
  const formatDate = useCallback((date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }, []);

  // API calls
  const fetchStorageLocations = useCallback(async () => {
    try {
      const url = `/api/storagelocation?StorageType=CA&LocationType=STORAGELOCATION&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED&IsActive=true`;
      const res = await apiClient.get(url);

      if (res?.data) {
        updateState({
          fielddata: {
            ...state.fielddata,
            storageLocations: res.data.map((location: any) => ({
              label: location.name,
              value: location.id
            })),
            Storagebyid: res.data
          }
        });
      }
    } catch (error) {
      console.error('Error fetching storage locations:', error);
    }
  }, [state.fielddata]);

  const fetchChambers = useCallback(async (locationId: string) => {
    try {
      const url = `/api/dropdown/storagelocation/${locationId}/chamber`;
      const res = await apiClient.get(url);

      if (res?.data) {
        updateState({
          fielddata: {
            ...state.fielddata,
            chamberOptions: res.data.map((chamber: any) => ({
              label: chamber.number,
              value: chamber.id
            })),
            Chamberbyid: res.data
          }
        });
      }
    } catch (err) {
      console.error('Error fetching chambers:', err);
    }
  }, [state.fielddata]);

  const submitStockMove = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare chamberQuantity object with additionalProp keys
      const chamberQuantity = chamberDetails.reduce((acc, chamber, index) => {
        if (chamber.caStorageLocation && chamber.chamberNumber && chamber.quantity) {
          return {
            ...acc,
            [`additionalProp${index + 1}`]: `${chamber.caStorageLocation}|${chamber.chamberNumber}|${chamber.quantity}`
          };
        }
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        isRejected: false, // Assuming we're not rejecting by default
        chamberQuantity,
        date: receivedDate.toISOString()
      };

      const response = await apiClient.put(
        `/api/mobile/stockmove/${stockMoveId}/castockin`,
        payload
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Stock move updated successfully');
        navigation.goBack();
      } else {
        throw new Error('Failed to update stock move');
      }
    } catch (error) {
      console.error('Error submitting stock move:', error);
      Alert.alert('Error', 'Failed to update stock move. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchStorageLocations();
  }, [fetchStorageLocations]);

  // Handler functions
  const addChamberDetail = () => {
    setChamberDetails(prev => [
      ...prev,
      {
        id: prev.length + 1,
        quantity: ''
      }
    ]);
  };

  const updateChamberDetail = (id: number, field: keyof ChamberDetail, value: string) => {
    setChamberDetails(prev => {
      const updatedDetails = prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      );

      if (field === 'caStorageLocation' && value) {
        fetchChambers(value);
      }

      return updatedDetails;
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    
    const currentDate = selectedDate || receivedDate;
    setShowDatePicker(Platform.OS === 'ios');
    setReceivedDate(currentDate);
  };

  const handleFormChange = (field: string, value: string) => {
    updateState({
      form: {
        ...state.form,
        [field]: value
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Receive Stock</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Truck Number*</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={state.form.TruckNumber}
              onChangeText={(val) => handleFormChange('TruckNumber', val)}
              placeholder="Enter truck number"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Health Report</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={healthReportOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Health Report"
            value={healthReport}
            onChange={item => setHealthReport(item.value)}
            renderItem={(item) => (
              <View style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </View>
            )}
            mode="modal"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chamber Details:</Text>

          {chamberDetails.map((item) => (
            <View key={item.id} style={styles.chamberRow}>
              <Text style={styles.chamberLabel}>S.No. {item.id}</Text>

              <Text style={styles.label}>CA Storage Location</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={state.fielddata.storageLocations || []}
                labelField="label"
                valueField="value"
                placeholder="Select CA Storage Location"
                value={item.caStorageLocation}
                onChange={selectedItem => updateChamberDetail(item.id, 'caStorageLocation', selectedItem.value)}
                renderItem={(item) => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </View>
                )}
              />

              <Text style={styles.label}>Chamber Number</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={state.fielddata.chamberOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Chamber Number"
                value={item.chamberNumber}
                onChange={selectedItem => updateChamberDetail(item.id, 'chamberNumber', selectedItem.value)}
                renderItem={(item) => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </View>
                )}
              />

              <Text style={styles.label}>Quantity (MT)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={item.quantity}
                  onChangeText={(text) => updateChamberDetail(item.id, 'quantity', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addChamberDetail}>
            <Text style={styles.addButtonText}>+ Add Chamber</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Received Date*</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={receivedDate ? styles.dateText : styles.placeholderText}>
              {formatDate(receivedDate)}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={receivedDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          activeOpacity={0.8}
          onPress={submitStockMove}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 15,
    backgroundColor: '#F6A001',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fafafa',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  unitText: {
    marginLeft: 5,
    color: '#777',
    fontSize: 14,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fafafa',
    marginBottom: 15,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#333',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  chamberRow: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chamberLabel: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#bbdefb',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RecieveStockmove;