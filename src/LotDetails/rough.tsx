import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';

import apiClient from '../../service/api/apiInterceptors';
const LotDetailsApproved = () => {
  const [lotData, setLotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchLotDetails = async () => {
      try {
        const response = await apiClient.get('/api/lotdetail?ApprovalStatus=PENDING&ApprovalStatus=APPROVED');
        setLotData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLotDetails();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading lot details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>Error loading data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);

          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!lotData || lotData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="info-outline" size={50} color="#3498db" />
        <Text style={styles.emptyText}>No approved lots found</Text>
        <Text style={styles.emptySubtext}>All approved lots will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>


      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Dropdown
          data={[
            { label: 'Direct', value: 'Direct' },
            { label: 'Normal', value: 'Normal' },
        
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select item"
          search
          searchPlaceholder="Search..."
          mode="modal"
          onChange={(item) => console.log('Selecteds:', item)}
        />







        {lotData.map((lot, index) => (
          <TouchableOpacity
            key={`${lot.id}-${index}`}
            activeOpacity={0.9}
            onPress={() => toggleExpandCard(lot.id)}
          >
            <View style={[
              styles.lotCard,
              expandedCard === lot.id && styles.expandedCard
            ]}>


              <View style={styles.lotHeader}>
                <View style={[styles.statusBadge, styles.approvedBadge]}>
                  <Text style={styles.statusText}>APPROVED</Text>
                </View>
                <MaterialIcons
                  name={expandedCard === lot.id ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={24}
                  color="#7f8c8d"
                />
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <FontAwesome name="truck" size={18} color="#2c3e50" />
                  <Text style={styles.sectionTitle}>Transport Details</Text>
                </View>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Truck Number</Text>
                    <Text style={styles.detailValue}>{lot.truckNumber}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Transporter</Text>
                    <Text style={styles.detailValue}>{lot.transporterName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Driver</Text>
                    <Text style={styles.detailValue}>{lot.driverName}</Text>
                  </View>
                </View>
              </View>


              {expandedCard === lot.id && (
                <>


                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>

                      <Ionicons name="calendar-outline" size={18} color="#27ae60" />
                      <Text style={styles.sectionTitle}>Quantity And Date</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <FontAwesome name="balance-scale" size={16} color="#e67e22" />
                        <Text style={styles.infoLabel}>Quantity</Text>
                        <Text style={styles.infoValue}>{lot.quantityMT} MT</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <MaterialIcons name="date-range" size={16} color="#3498db" />
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{formatDate(lot.date)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Storage Information */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="business-outline" size={18} color="#27ae60" />
                      <Text style={styles.sectionTitle}>Storage Information</Text>
                    </View>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{lot.storageLocation}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Chamber</Text>
                        <Text style={styles.detailValue}>{lot.storageChamber || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Type</Text>
                        <Text style={styles.detailValue}>{lot.storageType}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Vendor</Text>
                        <Text style={styles.detailValue}>{lot.vendorName}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#8e44ad',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginTop: 15,
    fontWeight: '600',
  },
  errorMessage: {
    marginTop: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8e44ad',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#3498db',
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#8e44ad',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  lotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  expandedCard: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 3,
  },
  section: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
});

export default LotDetailsApproved;