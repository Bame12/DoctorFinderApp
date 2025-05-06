// src/screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const MapScreen = () => {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(100); // Radius in kilometers

  // Ask for location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        
        // Fetch doctors after getting user location
        fetchDoctors();
      } catch (error) {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    })();
  }, []);

  // Fetch doctors data from Firestore
  const fetchDoctors = async () => {
    try {
      const doctorsCollection = collection(db, 'doctors');
      const doctorsSnapshot = await getDocs(doctorsCollection);
      const doctorsList = doctorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        coordinate: {
          latitude: doc.data().latitude || 0,
          longitude: doc.data().longitude || 0,
        }
      }));
      
      setDoctors(doctorsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Filter doctors within specified radius
  const getDoctorsInRadius = () => {
    if (!userLocation) return [];
    
    return doctors.filter(doctor => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        doctor.coordinate.latitude,
        doctor.coordinate.longitude
      );
      return distance <= radius;
    });
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2A86FF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const nearbyDoctors = getDoctorsInRadius();

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User's radius circle */}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={radius * 1000} // Convert km to meters
              strokeWidth={1}
              strokeColor="#2A86FF"
              fillColor="rgba(42, 134, 255, 0.1)"
            />
          )}
          
          {/* Doctor markers */}
          {nearbyDoctors.map(doctor => (
            <Marker
              key={doctor.id}
              coordinate={doctor.coordinate}
              title={doctor.name}
              description={doctor.specialty}
              onCalloutPress={() => navigation.navigate('DoctorDetail', { doctor })}
              pinColor="#2A86FF"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load map.</Text>
          <Text>Please enable location services and try again.</Text>
        </View>
      )}
      
      {/* Radius selection */}
      <View style={styles.radiusControl}>
        <Text style={styles.radiusText}>Search Radius: {radius} km</Text>
        <View style={styles.radiusButtonsContainer}>
          <TouchableOpacity 
            style={styles.radiusButton}
            onPress={() => setRadius(Math.max(10, radius - 10))}
          >
            <Ionicons name="remove" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.radiusButton}
            onPress={() => setRadius(Math.min(200, radius + 10))}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Info panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoPanelTitle}>Nearby Doctors</Text>
        <Text style={styles.infoPanelCount}>
          {nearbyDoctors.length} doctors found within {radius} km
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  radiusControl: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  radiusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radiusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    backgroundColor: '#2A86FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoPanelCount: {
    fontSize: 14,
    color: '#666',
  }
});

export default MapScreen;
