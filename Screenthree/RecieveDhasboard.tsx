import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, ScrollView, RefreshControl, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../App/Navbar';
import apiClient from '../service/api/apiInterceptors';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../types/Type';
import Footer from '../App/Footer';
import TruckCard from './TruckCard';
import NetInfo from "@react-native-community/netinfo";
import {useTranslation} from 'react-i18next';

const RecieveDhasboard = () => {
  const [dispatchCount, setDispatchCount] = useState<number | null>(null);
  const [recieveCount, setRecieveCount] = useState<number | null>(null);
  const [RequestRempending, setRequestRempending] = useState<number | null>(null);
  const [PaymentPaid, setPaymentPaid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
    const { t ,  i18n } = useTranslation();

  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        fetchCounts(); // Agar internet on hota hai toh data fetch hoga
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const dispatchResponse = await apiClient.get('/api/dispatch/truckcount/total?DispatchStatus=DISPATCHED');
      setDispatchCount(dispatchResponse.data);
            console.log('count 1' , dispatchResponse.data);

      const recieveResponse = await apiClient.get('/api/dispatch/truckcount/total?DispatchStatus=RECEIVED');
      setRecieveCount(recieveResponse.data);
        console.log('count 2' , recieveResponse.data);

      const requestRemPending = await apiClient.get('/api/mobile/reimbursment/count?ApprovalStatus=PENDING');
      setRequestRempending(requestRemPending.data);
      console.log('count 3' , requestRemPending.data);

      const paymentPaid = await apiClient.get('/api/mobile/reimbursment/count?BillPaymentStatus=PAID&ApprovalStatus=APPROVED');
      setPaymentPaid(paymentPaid.data);
           console.log('count 4' , paymentPaid.data);
          

      setError(null);
    } catch (err) {
      setError('Failed to fetch data');

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (isConnected) {
      fetchCounts();
    } else {
      setRefreshing(false);
    }
  }, [isConnected]);

  return (
    <View style={styles.mainContainer}>
      <Navbar />
      <SafeAreaView style={styles.container}>
        {isConnected ? (
          <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.cardContainer}>
              <View style={styles.cardWrapper}>
                <TruckCard
                  title={t('receivingPendingTruck')}
                  count={dispatchCount}
                  loading={loading}
                  error={error}
                  iconName="local-shipping"
                  onPress={() => navigation.navigate("Dispatch Truck List")}
                />
              </View>
              <View style={styles.cardWrapper}>
                <TruckCard
                title={t('receivedTruck')}
                  count={recieveCount}
                  loading={loading}
                  error={error}
                  iconName="directions-bus"
                  onPress={() => navigation.navigate("Receive Truck List")}
                />
              </View>
              <View style={styles.cardWrapper}>
                <TruckCard
              title={t('requestReimbursement')}
                  count={RequestRempending}
                  loading={loading}
                  error={error}
                  iconName="hourglass-empty"
                  onPress={() => navigation.navigate("ReimbursementList", { ApprovalStatus: "PENDING" })}
                />
              </View>
              <View style={styles.cardWrapper}>
                <TruckCard
                        title={t('paidPayment')}
                  count={PaymentPaid}
                  loading={loading}
                  error={error}
                  iconName="done"
                  onPress={() => navigation.navigate("ReimbursementList", { BillPaymentStatus: "PAID", ApprovalStatus: "APPROVED" })}
                />
              </View>
              <View style={styles.cardWrapper}>
                <TruckCard
                  title={t('paymentDeclined')}
                  count={PaymentPaid}
                  loading={loading}
                  error={error}
                  iconName="cancel"
                  onPress={() => navigation.navigate("ReimbursementList", { BillPaymentStatus: "DECLINE", ApprovalStatus: "APPROVED" })}
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.noInternetContainer}>
            <Text style={styles.noInternetText}>No Internet Connection</Text>
          </View>
        )}
      </SafeAreaView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  scrollView: {
    flexGrow: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cardWrapper: {
    width: '50%',
    
 
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInternetText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
});

export default RecieveDhasboard;
