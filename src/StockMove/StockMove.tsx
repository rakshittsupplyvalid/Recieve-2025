import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Platform , TouchableOpacity} from 'react-native';
import apiClient from '../../service/api/apiInterceptors';
import { Ionicons } from '@expo/vector-icons';
import useForm from '../../service/UseForm';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/Type';

const StockMove = () => {
  const { state, updateState } = useForm();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fielddata: { stockData = [], loading = true, refreshing = false } = {} } = state;

  const fetchStockData = async () => {
    try {
      updateState({
        fielddata: { loading: true, refreshing: true }
      });

      const response = await apiClient.get('/api/stockmove?ApprovalStatus=PENDING&ApprovalStatus=APPROVED');
      
      updateState({
        fielddata: { 
          stockData: response.data,
          loading: false,
          refreshing: false
        }
      });
    } catch (err) {
      console.error('Error fetching stock data:', err);
      updateState({
        fielddata: { 
          loading: false,
          refreshing: false
        }
      });
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);


  
  const handleReject = (itemId : any) => {
      console.log('Passed ID:', itemId); // This will log the ID to console
  
    navigation.navigate('Reject Stockmove', { stockMoveId: itemId });
  
  };

  const handleReceive = (itemId : any) => {
  
    navigation.navigate('Recieve Stockmove', { stockMoveId: itemId });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[
          styles.statusBadge,
          item.approvalStatus === 'APPROVED' ? styles.approvedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>{item.approvalStatus}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.stockMoveDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.infoText}>{item.toStorageLocation}</Text>
        </View>

        <View style={styles.quantityContainer}>
          <View style={styles.quantityBox}>
            <Text style={styles.quantityLabel}>Quantity IN</Text>
            <Text style={styles.quantityValue}>{item.quantityMTIn} MT</Text>
          </View>

          <View style={styles.quantityBox}>
            <Text style={styles.quantityLabel}>Quantity Out</Text>
            <Text style={styles.quantityValue}>{item.quantityMTOut} MT</Text>
          </View>

          <View style={styles.quantityBox}>
            <Text style={styles.quantityLabel}>Quantity Return</Text>
            <Text style={styles.quantityValue}>{item.quantityMTReturn} MT</Text>
          </View>
        </View>

        <View style={styles.transporterRow}>
          <View style={styles.transporterInfo}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Transporter</Text>
              <View style={styles.infoWithIcon}>
                <Ionicons name="car" size={16} color="#666" />
                <Text style={styles.infoText}>{item.transporterName}</Text>
              </View>
            </View>
          </View>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Truck Number</Text>
            <Text style={styles.truckNumber}>{item.truckNumber}</Text>
          </View>
        </View>

         <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => handleReject(item.id)}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.receiveButton]}
                      onPress={() => handleReceive(item.id)}
                    >
                      <Text style={styles.buttonText}>Receive</Text>
                    </TouchableOpacity>
                  </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={fetchStockData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No stock movements found</Text>
          </View>
        }
      />
    </View>
  );
};

// Keep your existing styles object
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  moveId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#e6f7ee',
  },
  pendingBadge: {
    backgroundColor: '#fff4e6',
  },
  statusText: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  quantityBox: {
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transporterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  labelContainer: {
    flexDirection: 'column',
  },
  labelText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  infoWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckNumber: {
    backgroundColor: '#e6f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#4a90e2',
    fontWeight: '500',
    fontSize: 14,
  },
  transporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
    actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: '#ffcccb',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  receiveButton: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  buttonText: {
    fontWeight: '600',
    color: '#333',
  },
 
});

export default StockMove;