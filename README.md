# Doctor Finder Mobile App

A cross-platform mobile application built with React Native and Firebase to help users find private doctors in their area.

## Developed by
- **Name:** Bame Junior Noko
- **Student ID:** NB22000934
- **Course:** COMP 302 - Data Structures and Algorithms

## Features

- Search for doctors by specialty and location
- View doctor profiles with detailed information
- Find doctors within 100km of your location on a map
- Book appointments with doctors
- Manage your appointment history
- User authentication (register/login)

## Technologies Used

- React Native / Expo
- Firebase (Authentication, Firestore, Storage)
- Google Maps integration
- Node.js

## Installation and Setup

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Update Firebase configuration in `src/firebase/config.js`
5. Update `.env` file with your API keys
6. Start the application:
   ```
   npx expo start
   ```

## Project Structure

```
DoctorFinderApp/
├── src/
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable components
│   ├── screens/       # Screen components
│   ├── navigation/    # Navigation setup
│   ├── firebase/      # Firebase configuration
│   ├── services/      # API services
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   └── context/       # Context providers
├── App.js             # Main application component
├── babel.config.js    # Babel configuration
└── app.json           # Expo configuration
```

## Firebase Collections

The application uses the following Firestore collections:

- **doctors**: Doctor profiles with details like specialty, contact info, and location
- **users**: User profiles
- **specialties**: List of medical specialties
- **reviews**: User reviews of doctors
- **appointments**: Appointment bookings

## Additional Notes

This application was developed as part of the COMP 302 Data Structures and Algorithms course assignment.
