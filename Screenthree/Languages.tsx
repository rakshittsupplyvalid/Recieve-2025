import React, { useState } from 'react';
import { View, StyleSheet, ScrollView ,  SafeAreaView  , KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { storage } from '../service/i18n'; 
import Navbar from '../App/Navbar';


const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
    storage.set('user-language', lang);
  };

  return (

    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : null}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
  >
    <SafeAreaView style={styles.container}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollView}>
    <View style={styles.content}>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={changeLanguage}
        style={styles.picker}
        mode="dropdown"
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="हिंदी" value="hi" />
     
     
      </Picker>
    </View>
    </View>

     </ScrollView>
    
          </SafeAreaView>
  
        </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white', // Light background for the entire screen
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 50,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default LanguageSelector;
