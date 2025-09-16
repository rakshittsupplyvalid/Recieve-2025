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
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const fetchHealthReports = async () => {
    setLoading(true);
    try {
      const url = `/api/mobile/healthreport/list?ReportType=DISPATCH&ReportDispatchType=NORMAL&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`;

      const response = await api.get(url);
      const newReports = response.data || [];
      console.log('Fetched reports:', newReports);

      setReports(newReports);
      setFilteredReports(filterReports(newReports, searchQuery));
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
        item.truckNumber?.toLowerCase().includes(lowerQuery) ||
        item.assayerName?.toLowerCase().includes(lowerQuery) ||
        formattedDate.includes(lowerQuery)
      );
    });
  };

  useEffect(() => {
    fetchHealthReports();
  }, []);

  useEffect(() => {
    setFilteredReports(filterReports(reports, searchQuery));
  }, [searchQuery, reports]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navbar />
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search Truck, Assayer or Dates"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F79B00" style={{ marginTop: 20 }} />
      ) : (
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
                  <Text style={styles.value}>{item.assayerName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{t('Date')}</Text>
                  <Text style={styles.value}>{moment(item.date).format('DD-MM-YYYY')}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{t('TruckNumber')}</Text>
                  <Text style={styles.value}>{item.truckNumber}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading && (
              <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16 }}>
                No Data Found
              </Text>
            )
          }
        />
      )}
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
