import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, FlatList, ActivityIndicator, View , TextInput } from 'react-native';
import Navbar from '../App/Navbar';
import api from '../service/api/apiInterceptors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Type';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

type DispatchRecieve = StackNavigationProp<RootStackParamList, 'DispatchRecieve'>;

const PAGE_SIZE = 30 ; 

const Dispatchlist = () => {
  const navigation = useNavigation<DispatchRecieve>();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


     const { t ,  i18n } = useTranslation();


      useFocusEffect(
         useCallback(() => {
           setSearchQuery('');
           setPage(1);
           setHasMore(true);
         }, [])
       );

  const fetchHealthReports = async (pageNumber: number) => {
    if (!hasMore) return;
    try {
      const response = await api.get(`/api/dispatch?DispatchStatus=DISPATCHED&PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`);
      if (response.data.length > 0) {
        setReports(prevReports => [...prevReports, ...response.data]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching health reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(item => {
    const formattedDate = moment(item.dispatchdate).format('DD-MM-YYYY');
    const quantity = String(item.quantitymt);
  
    return (
      Object.entries(item).some(([key, value]) =>
        typeof value === 'string' &&
        key !== 'quantitymt' && key !== 'dispatchdate' &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      formattedDate.includes(searchQuery) ||
      quantity.includes(searchQuery)
    );
  });
  
  

  useEffect(() => {
    fetchHealthReports(page);
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />

      <View style={styles.searchContainer}> 

   
      <TextInput
  placeholder={t('Search')}
  value={searchQuery}
  onChangeText={setSearchQuery}
  style={styles.searchInput}
/>
</View>


      <FlatList
       data={filteredReports}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <View style={styles.dispatchbranchContainer}>
              <View style={styles.row}>
                <Text style={styles.labelheading}>{t('DispatchBranch')}</Text>
                <Text style={styles.valueheading}>{item.dispatchbranch}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>{t('District')}:</Text>
                <Text style={styles.value}>{item.destinationdistrict}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('Quantity')}</Text>
                <Text style={styles.value}>{item.quantitymt}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('Date')}</Text>
                <Text style={styles.value}>{moment(item.dispatchdate).format('DD-MM-YYYY')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('TruckNumber')}</Text>
                <Text style={styles.value}>{item.trucknumber}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('Transporter')}</Text>
                <Text style={styles.value}>{item.transportername}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('DispatchType')}</Text>
                <Text style={styles.value}>{item.dispatchtype}</Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={loading && hasMore ? <ActivityIndicator size="large" color="blue" /> : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardContainer: {
    marginBottom: 10,
    padding: 20,
  },
  dispatchbranchContainer: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#f6a001',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    margin: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    elevation: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 15
  },
  value: {
    color: "#555",
    fontSize: 15
  },
  labelheading: {
    fontWeight: "bold",
    color: "white",
    fontSize: 17
  },
  valueheading: {
    color: "white",
    fontSize: 17
  },
});

export default Dispatchlist;
