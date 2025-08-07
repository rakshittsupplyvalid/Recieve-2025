import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Platform, TouchableOpacity } from 'react-native';
import apiClient from '../../service/api/apiInterceptors';
import { Ionicons } from '@expo/vector-icons';
import useForm from './useForm';

const StockMove = ({ navigation }) => {
  const { state, updateState } = useForm();
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

  React.useEffect(() => {
    fetchStockData();
  }, []);

  const handleReject = (itemId) => {
    // Navigate to Reject component with the item ID
    navigation.navigate('RejectStockMove', { stockMoveId: itemId });
  };

  const handleReceive = (itemId) => {
    // Navigate to Receive component with the item ID
    navigation.navigate('ReceiveStockMove', { stockMoveId: itemId });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.moveId}>ID: {item.id}</Text>
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

        {item.approvalStatus === 'APPROVED' && (
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
        )}
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

const styles = StyleSheet.create({
  // ... (keep all existing styles)

  // Add these new styles for the buttons
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
    backgroundColor: '#ffebee',
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
  moveId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default StockMove;