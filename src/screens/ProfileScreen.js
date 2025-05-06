// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, signOut } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      fetchUserAppointments(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user appointments
  const fetchUserAppointments = async (user) => {
    try {
      const userId = user?.uid || 'userId1'; // Use authenticated user ID or default
      const appointmentsCollection = collection(db, 'appointments');
      const q = query(appointmentsCollection, where('patientId', '==', userId));
      const appointmentsSnapshot = await getDocs(q);
      
      const appointmentsList = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        appointmentDateTime: doc.data().appointmentDateTime?.toDate() || new Date()
      })).sort((a, b) => b.appointmentDateTime - a.appointmentDateTime);
      
      setAppointments(appointmentsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Handle login navigation
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Format date to display
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time to display
  const formatTime = (date) => {
    if (!date) return 'Unknown time';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render appointment item
  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.appointmentCard,
        { borderLeftColor: getStatusColor(item.status) }
      ]}
    >
      <View style={styles.appointmentHeader}>
        <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.appointmentDateTime)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatTime(item.appointmentDateTime)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="medical-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.reason}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#28A745';
      case 'pending':
        return '#FFC107';
      case 'cancelled':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/doctor-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Doctor Finder</Text>
      </View>

      <View style={styles.profileSection}>
        {user ? (
          <>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{user.displayName || 'Bame Junior Noko'}</Text>
            <Text style={styles.profileEmail}>{user.email || 'bzouniornoko@gmail.com'}</Text>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="person-circle-outline" size={80} color="#DDD" />
            <Text style={styles.guestText}>Guest User</Text>
            <Text style={styles.guestSubtext}>Login to access all features</Text>
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login / Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.appointmentsSection}>
        <Text style={styles.sectionTitle}>My Appointments</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#2A86FF" style={styles.loader} />
        ) : appointments.length > 0 ? (
          <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={50} color="#DDD" />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>Your upcoming appointments will appear here</Text>
          </View>
        )}
      </View>

      <View style={styles.studentInfoSection}>
        <Text style={styles.studentInfoTitle}>Developed by:</Text>
        <Text style={styles.studentName}>Bame Junior Noko</Text>
        <Text style={styles.studentId}>NB22000934</Text>
        <Text style={styles.courseInfo}>COMP 302 - Data Structures and Algorithms</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A86FF',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  guestText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  guestSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2A86FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appointmentsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loader: {
    marginVertical: 20,
  },
  appointmentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 5,
    overflow: 'hidden',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    padding: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  studentInfoSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  studentInfoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentId: {
    fontSize: 14,
    color: '#666',
  },
  courseInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default ProfileScreen;
