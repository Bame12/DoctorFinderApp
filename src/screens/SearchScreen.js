// src/screens/SearchScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Searchbar, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsCollection = collection(db, 'doctors');
        const doctorsSnapshot = await getDocs(doctorsCollection);
        const doctorsList = doctorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Extract unique cities from doctor data
        const uniqueCities = [...new Set(doctorsList
          .filter(doc => doc.city)
          .map(doc => doc.city))];
        
        setCities(uniqueCities.map(city => ({ name: city })));
        setDoctors(doctorsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    const fetchSpecialties = async () => {
      try {
        const specialtiesCollection = collection(db, 'specialties');
        const specialtiesSnapshot = await getDocs(specialtiesCollection);
        const specialtiesList = specialtiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      }
    };

    fetchDoctors();
    fetchSpecialties();
  }, []);

  // Filter doctors based on search query, selected specialty, and city
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name && doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    const matchesCity = !selectedCity || doctor.city === selectedCity;
    return matchesSearch && matchesSpecialty && matchesCity;
  });

  // Handle specialty selection
  const handleSpecialtySelect = (specialty) => {
    if (selectedSpecialty === specialty) {
      setSelectedSpecialty(null); // Deselect if already selected
    } else {
      setSelectedSpecialty(specialty);
    }
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    if (selectedCity === city) {
      setSelectedCity(null); // Deselect if already selected
    } else {
      setSelectedCity(city);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    navigation.navigate('DoctorDetail', { doctor });
  };

  // Render doctor item
  const renderDoctorItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.doctorCard}
      onPress={() => handleDoctorSelect(item)}
    >
      <Image 
        source={{ uri: item.photoUrl || 'https://via.placeholder.com/150' }}
        style={styles.doctorImage}
      />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
        <Text style={styles.doctorCity}>{item.city || 'Location not specified'}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || '0'}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#2A86FF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Doctors</Text>
      </View>

      <Searchbar
        placeholder="Search by name..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Filter by Specialty:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          {specialties.map((item) => (
            <Chip
              key={item.id}
              style={[
                styles.filterChip,
                selectedSpecialty === item.name && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedSpecialty === item.name && styles.selectedFilterChipText
              ]}
              onPress={() => handleSpecialtySelect(item.name)}
            >
              {item.name}
            </Chip>
          ))}
        </ScrollView>

        <Divider style={styles.divider} />

        <Text style={styles.filterTitle}>Filter by City:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          {cities.map((item, index) => (
            <Chip
              key={index}
              style={[
                styles.filterChip,
                selectedCity === item.name && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedCity === item.name && styles.selectedFilterChipText
              ]}
              onPress={() => handleCitySelect(item.name)}
            >
              {item.name}
            </Chip>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2A86FF" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={item => item.id}
          renderItem={renderDoctorItem}
          contentContainerStyle={styles.doctorsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No doctors found. Try adjusting your filters.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A86FF',
  },
  searchBar: {
    margin: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  filtersContainer: {
    maxHeight: 200,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  chipScrollView: {
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  selectedFilterChip: {
    backgroundColor: '#2A86FF',
  },
  filterChipText: {
    color: '#333',
  },
  selectedFilterChipText: {
    color: 'white',
  },
  divider: {
    marginVertical: 8,
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorsList: {
    padding: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  doctorCity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#666',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SearchScreen;
