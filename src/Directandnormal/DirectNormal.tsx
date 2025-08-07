import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import LotDetailsApproved from '../LotDetails/LotDetailsApproved';
import StockMove from '../StockMove/StockMove';

type TableOption = {
  label: string;
  value: 'direct' | 'normal';
};

const tableOptions: TableOption[] = [
  { label: 'Direct', value: 'direct' },
  { label: 'Normal', value: 'normal' },
];

const DirectNormal: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'direct' | 'normal'>('direct');
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      
      
      <View style={styles.dropdownContainer}>
        <Dropdown
          style={[styles.dropdown, isFocus && styles.dropdownFocused]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={tableOptions}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select table type' : '...'}
          searchPlaceholder="Search..."
          value={selectedOption}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setSelectedOption(item.value);
            setIsFocus(false);
          }}
          renderItem={(item) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.label}</Text>
            </View>
          )}
        />
      </View>
      
      <View style={styles.tabContainer}>
        {tableOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.tab,
              selectedOption === option.value && styles.activeTab
            ]}
            onPress={() => setSelectedOption(option.value)}
          >
            <Text style={[
              styles.tabText,
              selectedOption === option.value && styles.activeTabText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      
        {selectedOption === 'direct' ? <StockMove /> : <LotDetailsApproved />}
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
   
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  dropdownContainer: {
   padding : 25,
    
   
  },
  dropdown: {
    height: 50,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownFocused: {
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#2c3e50',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: '#7f8c8d',
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  itemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 28,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#f1f2f6',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#F6A001',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default DirectNormal;