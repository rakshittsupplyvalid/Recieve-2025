import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, FlatList, ActivityIndicator, View, TextInput } from 'react-native';
import Navbar from '../App/Navbar';
import api from '../service/api/apiInterceptors';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

const DispatchReportList = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const pageSize = 30;
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
      setPageNumber(1);
      setHasMoreData(true);
    }, [])
  );

  const fetchHealthReports = async () => {
    if (!hasMoreData || loading) return;
    setLoading(true);
    try {
      const url = `/api/healthreport?ReportType=DISPATCH&PageNumber=${pageNumber}&PageSize=${pageSize}`;
      const response = await api.get(url);
      const newReports = response.data || [];
      const updatedReports = pageNumber === 1 ? newReports : [...reports, ...newReports];

      setReports(updatedReports);
      setFilteredReports(filterReports(updatedReports, searchQuery));
      if (newReports.length < pageSize) {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error fetching health reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = (data, query) => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter(item => {
      const formattedDate = moment(item.date).add(5, "hours").format("DD-MM-YYYY");
      return (
        item.trucknumber?.toLowerCase().includes(lowerQuery) ||
        item.assayername?.toLowerCase().includes(lowerQuery) ||
        formattedDate.includes(lowerQuery)
      );
    });
  };

  useEffect(() => {
    fetchHealthReports();
  }, [pageNumber]);

  useEffect(() => {
    setFilteredReports(filterReports(reports, searchQuery));
  }, [searchQuery, reports]);

  const handleLoadMore = () => {
    if (!loading && hasMoreData) {
      setPageNumber(prevPage => prevPage + 1);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navbar />
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search Truck, Assayer or Date"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.one}>
            <View style={styles.card}>
              <View style={styles.topRightCorner} />
              <View style={styles.bottomLeftCorner} />
              <View style={styles.row}>
                <Text style={styles.label}>{t('assyarerName')}</Text>
                <Text style={styles.value}>{item.assayername}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('Date')}</Text>
                <Text style={styles.value}>{moment(item.date).format('DD-MM-YYYY')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('TruckNumber')}</Text>
                <Text style={styles.value}>{item.trucknumber}</Text>
              </View>
            </View>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
        ListEmptyComponent={!loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>No Data Found</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  one: { paddingHorizontal: 30, backgroundColor: 'white' },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    marginVertical: 10,
    height: 175,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontWeight: 'bold', color: '#333', flex: 0.5, fontSize: 15 },
  value: { color: '#555', flex: 0.5, flexWrap: 'wrap' },
  topRightCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 25,
    height: 25,
    backgroundColor: '#F79B00',
    borderTopRightRadius: 10,
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 25,
    height: 25,
    backgroundColor: '#F79B00',
    borderBottomLeftRadius: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default DispatchReportList;

