import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Card, Button, Divider } from '@rneui/themed';

const ProfileApp = () => {
  const handleCardPress = (section: string) => {
    console.log(`${section} card pressed`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Avatar
            rounded
            source={{ uri: 'https://randomuser.me/api/portraits/men/41.jpg' }}
            size="xlarge"
            containerStyle={styles.avatar}
          />
          <Badge
            status="success"
            containerStyle={styles.badgeContainer}
            value="Online"
            textStyle={styles.badgeText}
          />
          <Text style={styles.profileName}>John Doe</Text>

        </View>

        {/* Divider */}
        <Divider style={styles.divider} />

        {/* Cards Section */}
        <View style={styles.cardContainer}>
          <Card containerStyle={styles.card}>
            <Card.Title style={styles.cardTitle}>My Orders</Card.Title>
            <Card.Divider />
            <Text style={styles.cardText}>View and manage your orders seamlessly.</Text>
            <Button
              title="View Orders"
              buttonStyle={styles.cardButton}
              onPress={() => handleCardPress('My Orders')}
            />
          </Card>

          <Card containerStyle={styles.card}>
            <Card.Title style={styles.cardTitle}>Settings</Card.Title>
            <Card.Divider />
            <Text style={styles.cardText}>Customize your preferences and account settings.</Text>
            <Button
              title="Go to Settings"
              buttonStyle={styles.cardButton}
              onPress={() => handleCardPress('Settings')}
            />
          </Card>

          <Card containerStyle={styles.card}>
            <Card.Title style={styles.cardTitle}>Support</Card.Title>
            <Card.Divider />
            <Text style={styles.cardText}>Reach out to us for any assistance or queries.</Text>
            <Button
              title="Contact Support"
              buttonStyle={styles.cardButton}
              onPress={() => handleCardPress('Support')}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f3f5',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 20,
  },
  avatar: {
    marginBottom: 15,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 55,
    right: 140,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  divider: {
    marginVertical: 15,
    marginHorizontal: 30,
    backgroundColor: '#ddd',
    height: 1,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    color: '#6200EE',
    textAlign: 'center',
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  cardButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 10,
  },
});

export default ProfileApp;
