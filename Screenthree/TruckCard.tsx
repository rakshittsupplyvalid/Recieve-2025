import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';

interface TruckCardProps {
  title: string;
  count: number | null;
  loading: boolean;
  error: string | null;
  iconName: string;
  onPress: () => void;
}

const TruckCard: React.FC<TruckCardProps> = ({ title, count, loading, error, iconName, onPress }) => {

      const { t ,  i18n } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Top Right Corner */}
      <View style={styles.topRightCorner} />

      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.iconContainer}>
        <MaterialIcons name={iconName} size={22} color="white" />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#000000" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.cardDescription}>{t('Count')} {count}</Text>
      )}

      {/* Bottom Left Corner */}
      <View style={styles.bottomLeftCorner} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 25,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    height: 150,
    width : 150,
    justifyContent: 'center',
    backgroundColor: 'white',

  },
  cardTitle: {
    fontSize: 15,
    color: 'black',
    marginTop: 10,
    width: 130,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    color: 'black',
    marginTop: 5,
    textAlign: 'center',

  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginTop: 5,
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: "#F79B0099",
    padding: 10,
    borderRadius: 50,
  },
  topRightCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 25,
    height: 25,
    backgroundColor: '#F79B0099',
    borderTopRightRadius: 10,
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 25,
    height: 25,
    backgroundColor: '#F79B0099',
    borderBottomLeftRadius: 10,
  },
});

export default TruckCard;
