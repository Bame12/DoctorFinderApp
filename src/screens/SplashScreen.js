// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const DoctorFinderSplash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Simulate loading time for splash screen
    const loadApp = async () => {
      try {
        // Wait for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Hide splash screen
        await SplashScreen.hideAsync();
        // Navigate to login screen
        navigation.replace('Login');
      } catch (e) {
        console.warn(e);
      }
    };

    loadApp();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/doctor-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Doctor Finder</Text>
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={styles.studentName}>Bame Junior Noko</Text>
        <Text style={styles.studentId}>NB22000934</Text>
        <Text style={styles.courseInfo}>COMP 302 - Data Structures and Algorithms</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A86FF',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  footerContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  studentId: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  courseInfo: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
});

export default DoctorFinderSplash;
