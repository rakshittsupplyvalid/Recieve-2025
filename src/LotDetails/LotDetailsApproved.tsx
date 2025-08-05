import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import apiClient from '../../service/api/apiInterceptors';

const LotDetailsApproved = () => {
  const [lotData, setLotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLotDetails = async () => {
      try {
        const response = await apiClient.get('/api/lotdetail?ApprovalStatus=PENDING&ApprovalStatus=APPROVED');
      
        
     
       
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLotDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading lot details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={50} color="#F44336" />
        <Text style={styles.errorText}>Error loading data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!lotData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="info-outline" size={50} color="#2196F3" />
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  // Format date to readable format
  const formattedDate = new Date(lotData.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lot Details</Text>
        <View style={[styles.statusBadge, styles.approvedBadge]}>
          <Text style={styles.statusText}>APPROVED</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="assignment" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Basic Information</Text>
        </View>
        
        <DetailRow icon="fingerprint" label="Lot ID" value={lotData.id} />
        <DetailRow icon="scale" label="Quantity (MT)" value={lotData.quantityMT.toString()} />
        <DetailRow icon="event" label="Date" value={formattedDate} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome name="truck" size={20} color="#2196F3" />
          <Text style={styles.cardTitle}>Transport Details</Text>
        </View>
        
        <DetailRow icon="directions-car" label="Truck Number" value={lotData.truckNumber} />
        <DetailRow icon="business" label="Transporter" value={lotData.transporterName} />
        <DetailRow icon="person" label="Driver" value={lotData.driverName} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="business-outline" size={22} color="#9C27B0" />
          <Text style={styles.cardTitle}>Storage Information</Text>
        </View>
        
        <DetailRow icon="location-on" label="Location" value={lotData.storageLocation} />
        <DetailRow icon="meeting-room" label="Chamber" value={lotData.storageChamber} />
        <DetailRow icon="category" label="Type" value={lotData.storageType} />
        <DetailRow icon="store" label="Vendor" value={lotData.vendorName} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Last updated: {formattedDate}</Text>
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <MaterialIcons name={icon} size={18} color="#757575" />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
    fontWeight: 'bold',
  },
  errorMessage: {
    marginTop: 5,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  approvedBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailIcon: {
    width: 30,
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});

export default LotDetailsApproved;