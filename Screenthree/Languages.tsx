import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { storage } from '../service/i18n'; 
import Navbar from '../App/Navbar';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English

  // Load saved language on initial render
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        console.log('Attempting to load language from storage...');
        const savedLang = await storage.getString('user-language');
        console.log('Saved language from storage:', savedLang);
        
        if (savedLang) {
          await i18n.changeLanguage(savedLang);
          setSelectedLanguage(savedLang);
          console.log(`Language set to ${savedLang}`);
        } else {
          // If no language saved, use device language or default to English
          const deviceLanguage = i18n.language || 'en';
          await i18n.changeLanguage(deviceLanguage);
          setSelectedLanguage(deviceLanguage);
          await storage.set('user-language', deviceLanguage);
          console.log(`No saved language, using device language: ${deviceLanguage}`);
        }
      } catch (error) {
        console.error('Error loading language:', error);
        // Fallback to English if error occurs
        await i18n.changeLanguage('en');
        setSelectedLanguage('en');
      }
    };
    
    loadLanguage();
  }, []);

  const changeLanguage = async (lang) => {
    try {
      console.log(`Changing language to: ${lang}`);
      await i18n.changeLanguage(lang);
      setSelectedLanguage(lang);
      await storage.set('user-language', lang);
      console.log(`Language successfully changed to ${lang}`);
    } catch (error) {
      console.error('Error changing language:', error);
      // Revert to previous language if change fails
      await i18n.changeLanguage(selectedLanguage);
    }
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
                testID="language-picker"
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="हिंदी" value="hi" />
                <Picker.Item label="मराठी" value="mr" />
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
    backgroundColor: 'white',
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
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default LanguageSelector;