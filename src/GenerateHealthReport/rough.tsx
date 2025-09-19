import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Switch, Modal, Platform, Image, ActivityIndicator, FlatList, Button, Linking, Alert, BackHandler, StyleSheet } from 'react-native';
// ... other imports remain the same

const TestForm = () => {
  // ... existing state and variables
  
  // Add a new state for transport type
  const [transportType, setTransportType] = useState('TRUCK'); // Default to TRUCK

  // ... existing useEffect and functions

  // Modify the step 1 validation to handle both truck and train
  const handleNext = (nextStep: number) => {
    let validationResult: { isValid: boolean; message?: string } | null = null;

    if (currentStep === 0) {
      // ... existing validation for step 0
    }
    else if (currentStep === 1) {
      // Transport type specific validation
      if (transportType === 'TRUCK') {
        const truckNumber = state.form.Trucknumber || "";
        
        if (truckNumber.length < 6) {
          alert("Truck number must be at least 6 characters");
          return;
        }
        
        if (truckNumber.length > 12) {
          alert("Truck number must not be more than 12 characters");
          return;
        }
      } else if (transportType === 'TRAIN') {
        const trainNo = state.form.TrainNo || "";
        const coachNo = state.form.CoachNo || "";
        
        if (!trainNo || trainNo.length === 0) {
          alert("Please enter train number");
          return;
        }
        
        if (!coachNo || coachNo.length === 0) {
          alert("Please enter coach number");
          return;
        }
      }

      // Common validation for both transport types
      if (!state.form.grossWeight || isNaN(parseFloat(state.form.grossWeight))) {
        alert('Please enter a valid gross weight');
        return;
      }
      if (!state.form.tareWeight || isNaN(parseFloat(state.form.tareWeight))) {
        alert('Please enter a valid tare weight');
        return;
      }
      if (!state.form.date) {
        alert('Please select a date');
        return;
      }
      if (!state.form.bagCount || isNaN(parseInt(state.form.bagCount))) {
        alert('Please enter a valid bag count');
        return;
      }
    }
    // ... rest of the validation

    // Proceed to next step if validation passes
    updateState({
      ...state,
      hidden: {
        ...state.hidden,
        previousSteps: [...previousSteps, currentStep],
        currentStep: nextStep
      }
    });
  };

  // Modify the payload creation to handle both transport types
  const handleSubmit = () => {
    // ... existing validation
    
    const payload = {
      DestinationBranch: state.form?.option2 || '',
      DestinationLocationId: state.form?.Storagedata || '',
      // Include transport type specific fields
      TruckNumber: transportType === 'TRUCK' ? state.form?.Trucknumber || '' : '',
      TrainNo: transportType === 'TRAIN' ? state.form?.TrainNo || '' : '',
      CoachNo: transportType === 'TRAIN' ? state.form?.CoachNo || '' : '',
      // ... rest of the payload
    }

    // ... rest of the submit function
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* ... existing header */}

        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Step 0 - Company, Branch, Storage (unchanged) */}

          {/* Step 1 - Transport Information */}
          {currentStep === 1 && (
            <View style={styles.onecontainers}>
              {/* Transport Type Selection */}
              <View style={styles.radioContainer}>
                <Text style={styles.radioLabel}>Transport Type:</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={[styles.radioButton, transportType === 'TRUCK' && styles.radioButtonSelected]}
                    onPress={() => setTransportType('TRUCK')}
                  >
                    <Text style={[styles.radioText, transportType === 'TRUCK' && styles.radioTextSelected]}>
                      Truck
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.radioButton, transportType === 'TRAIN' && styles.radioButtonSelected]}
                    onPress={() => setTransportType('TRAIN')}
                  >
                    <Text style={[styles.radioText, transportType === 'TRAIN' && styles.radioTextSelected]}>
                      Train
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Conditionally render fields based on transport type */}
              {transportType === 'TRUCK' ? (
                <TextInput
                  style={styles.input}
                  placeholder={t('TruckNumber')}
                  value={state.form?.Trucknumber || ''}
                  onChangeText={(text) => {
                    const upperText = text.toUpperCase();
                    updateState({
                      ...state,
                      form: {
                        ...state.form,
                        Trucknumber: upperText,
                      }
                    });
                  }}
                  autoCapitalize="characters"
                  keyboardType="default"
                  maxLength={13}
                />
              ) : (
                <>
                  {/* Train Number */}
                  <TextInput
                    style={styles.input}
                    placeholder={t('TrainNo')}
                    value={state.form?.TrainNo || ''}
                    onChangeText={(text) => {
                      const numbersOnly = text.replace(/[^0-9]/g, '');
                      updateState({
                        ...state,
                        form: {
                          ...state.form,
                          TrainNo: numbersOnly,
                        }
                      });
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />

                  {/* Coach Number */}
                  <TextInput
                    style={styles.input}
                    placeholder={t('CoachNo')}
                    value={state.form?.CoachNo || ''}
                    onChangeText={(text) => {
                      const upperText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      updateState({
                        ...state,
                        form: {
                          ...state.form,
                          CoachNo: upperText,
                        }
                      });
                    }}
                    autoCapitalize="characters"
                    keyboardType="default"
                    maxLength={4}
                  />
                </>
              )}

              {/* Common fields for both transport types */}
              <TextInput
                style={styles.input}
                placeholder={t('Grossweight')}
                value={state.form?.grossWeight || ''}
                onChangeText={handleGrossWeightChange}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder={t('Tareweight')}
                value={state.form?.tareWeight || ''}
                onChangeText={handleTareWeightChange}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder={t('Netweight')}
                value={state.form?.netWeight || ''}
                editable={false}
              />

              <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    editable={false}
                    placeholder={t('SelectDate')}
                    value={state.form?.date ? new Date(state.form.date).toLocaleDateString() : ''}
                  />
                </View>
              </TouchableOpacity>

              {isDatePickerVisible && (
                <DateTimePicker
                  value={state.form?.date ? new Date(state.form.date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => handleDateConfirm(date)}
                  minimumDate={threeMonthsAgo}
                  maximumDate={today}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder={t('Bagcount')}
                value={state.form?.bagCount || ''}
                onChangeText={(text) => updateState({
                  ...state,
                  form: {
                    ...state.form,
                    bagCount: text
                  }
                })}
                keyboardType="numeric"
                maxLength={5}
              />
              
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={state.form?.size || ""}
                  onValueChange={(value) =>
                    updateState({
                      ...state,
                      form: {
                        ...state.form,
                        size: value,
                      },
                    })
                  }
                >
                  <Picker.Item label="Select Onion Size" value="" />
                  {sizeOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>

              <View style={styles.buttoncontent}>
                <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                  <Text style={styles.buttonText}>{t('Previous')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handleNext(2)}>
                  <Text style={styles.buttonText}>{t('Next')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ... rest of the steps remain unchanged */}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// Add these new styles to your styles object
const styles = StyleSheet.create({
  // ... existing styles
  radioContainer: {
    marginBottom: 20,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  radioText: {
    color: '#000',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // ... other styles
});

export default TestForm;