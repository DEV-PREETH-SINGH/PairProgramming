import { baseUrl } from "@env";
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

const ProfileCompletionScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const currentUser = auth().currentUser;
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Profile picture state
  const [profilePic, setProfilePic] = useState(null);
  
  // Step 1: Personal Info
  const [username, setUsername] = useState('');
  const [leetcodeProfileId, setLeetcodeProfileId] = useState('');
  
  // Step 2: Language & Time Preferences
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [otherLanguage, setOtherLanguage] = useState('');
  const [preferredSolvingTime, setPreferredSolvingTime] = useState('');
  
  // Step 3: DSA Preferences
  const [dsaSheet, setDsaSheet] = useState('');
  const [otherDsaSheet, setOtherDsaSheet] = useState('');
  const [dailyProblems, setDailyProblems] = useState('');
  const [customDailyProblems, setCustomDailyProblems] = useState('');

  // Select profile image
  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error) {
        setProfilePic(response.assets[0]);
      }
    });
  };

  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // Form validation for each step
  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!profilePic) return "Please select a profile picture";
        if (!username) return "Please enter your username";
        if (!leetcodeProfileId) return "Please enter your Leetcode Profile ID";
        break;
      case 2:
        if (!preferredLanguage) return "Please select your preferred coding language";
        if (preferredLanguage === 'Other' && !otherLanguage) return "Please specify your coding language";
        if (!preferredSolvingTime) return "Please select your preferred coding time";
        break;
      case 3:
        if (!dsaSheet) return "Please select a DSA sheet";
        if (dsaSheet === 'Other' && !otherDsaSheet) return "Please specify your DSA sheet";
        if (!dailyProblems) return "Please select how many problems you want to solve daily";
        if (dailyProblems === 'Custom' && !customDailyProblems) return "Please specify how many problems";
        break;
      default:
        return null;
    }
    return null;
  };

  // Handle next button with validation
  const handleNext = () => {
    const error = validateStep();
    if (error) {
      Alert.alert('Required Information', error);
      return;
    }
    nextStep();
  };

  // Handle final submission
  const handleProfileSubmit = async () => {
    const error = validateStep();
    if (error) {
      Alert.alert('Required Information', error);
      return;
    }

    try {
      setLoading(true);

      // Prepare form data with all collected information
      const formData = new FormData();
      
      // Basic profile info
      formData.append('profilePic', {
        uri: profilePic.uri,
        type: profilePic.type,
        name: profilePic.fileName,
      });
      formData.append('uid', currentUser.uid);
      formData.append('email', currentUser.email);
      formData.append('username', username);
      formData.append('leetcodeProfileId', leetcodeProfileId);
      
      // Step 2 data
      formData.append('preferredLanguage', preferredLanguage === 'Other' ? otherLanguage : preferredLanguage);
      formData.append('preferredSolvingTime', preferredSolvingTime);
      
      // Step 3 data
      formData.append('dsaSheet', dsaSheet === 'Other' ? otherDsaSheet : dsaSheet);
      formData.append('dailyProblems', dailyProblems === 'Custom' ? customDailyProblems : dailyProblems);

      const response = await axios.post(`${baseUrl}/create-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render the progress bar
  const renderProgressBar = () => {
    const totalSteps = 3;
    const progressWidth = (currentStep / totalSteps) * 100;
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressLabels}>
          {[1, 2, 3].map((step) => (
            <Text 
              key={step} 
              style={[
                styles.progressLabel, 
                currentStep >= step ? styles.activeLabel : styles.inactiveLabel
              ]}
            >
              {step === 1 && "Profile Info"}
              {step === 2 && "Language & Time"}
              {step === 3 && "DSA Preferences"}
            </Text>
          ))}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
        </View>
      </View>
    );
  };

  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Complete Your Profile</Text>
            <Text style={styles.stepDescription}>Let's set up your profile so you can find the perfect coding partner.</Text>
            
            <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
              {profilePic ? (
                <Image source={{ uri: profilePic.uri }} style={styles.profilePic} />
              ) : (
                <View style={styles.imagePlaceholderContainer}>
                  <Text style={styles.imagePlaceholder}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#8a8a8a"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>LeetCode Profile ID</Text>
              <TextInput
                style={styles.input}
                value={leetcodeProfileId}
                onChangeText={setLeetcodeProfileId}
                placeholder="Enter your LeetCode username"
                placeholderTextColor="#8a8a8a"
              />
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your Coding Preferences</Text>
            <Text style={styles.stepDescription}>Tell us about your coding habits to find compatible partners.</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>What's your coding language of choice?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={preferredLanguage}
                  style={styles.picker}
                  onValueChange={setPreferredLanguage}
                >
                  <Picker.Item label="Select Programming Language" value="" />
                  <Picker.Item label="Python 🐍" value="Python" />
                  <Picker.Item label="Java ☕" value="Java" />
                  <Picker.Item label="C++ 🚀" value="C++" />
                  <Picker.Item label="JavaScript 💻" value="JavaScript" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </View>
            
            {preferredLanguage === 'Other' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Language</Text>
                <TextInput
                  style={styles.input}
                  value={otherLanguage}
                  onChangeText={setOtherLanguage}
                  placeholder="Specify your language"
                  placeholderTextColor="#8a8a8a"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>When do you typically code?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={preferredSolvingTime}
                  style={styles.picker}
                  onValueChange={setPreferredSolvingTime}
                >
                  <Picker.Item label="Select Preferred Coding Time" value="" />
                  <Picker.Item label="Morning ☀️" value="Morning" />
                  <Picker.Item label="Afternoon 🌤" value="Afternoon" />
                  <Picker.Item label="Evening 🌙" value="Evening" />
                  <Picker.Item label="Late Night 🦉" value="Late Night" />
                  <Picker.Item label="Anytime ⏳" value="Anytime" />
                </Picker>
              </View>
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>DSA Learning Plan</Text>
            <Text style={styles.stepDescription}>Set your DSA learning goals to track your progress together.</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Which DSA sheet are you working on?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dsaSheet}
                  style={styles.picker}
                  onValueChange={setDsaSheet}
                >
                  <Picker.Item label="Select DSA Sheet" value="" />
                  <Picker.Item label="Blind75 🏆" value="Blind75" />
                  <Picker.Item label="NeetCode 📜" value="NeetCode" />
                  <Picker.Item label="Striver's Guide 🚀" value="Striver's Guide" />
                  <Picker.Item label="LeetCode Top 100" value="LeetCode Top 100" />
                  <Picker.Item label="My Own Path 🛤️" value="My Own Path" />
                </Picker>
              </View>
            </View>
            
            {dsaSheet === 'Other' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Custom DSA Sheet</Text>
                <TextInput
                  style={styles.input}
                  value={otherDsaSheet}
                  onChangeText={setOtherDsaSheet}
                  placeholder="Specify your DSA sheet"
                  placeholderTextColor="#8a8a8a"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Daily problem goal?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dailyProblems}
                  style={styles.picker}
                  onValueChange={setDailyProblems}
                >
                  <Picker.Item label="Select Daily Problems" value="" />
                  <Picker.Item label="1️⃣ problem" value="1" />
                  <Picker.Item label="2️⃣ problems" value="2" />
                  <Picker.Item label="3️⃣ problems" value="3" />
                  <Picker.Item label="4️⃣ problems" value="4" />
                  <Picker.Item label="5️⃣+ problems" value="5+" />
                  <Picker.Item label="Custom" value="Custom" />
                </Picker>
              </View>
            </View>
            
            {dailyProblems === 'Custom' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Custom Goal</Text>
                <TextInput
                  style={styles.input}
                  value={customDailyProblems}
                  onChangeText={setCustomDailyProblems}
                  placeholder="How many problems?"
                  keyboardType="numeric"
                  placeholderTextColor="#8a8a8a"
                />
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  // Navigation buttons
  const renderButtons = () => (
    <View style={styles.buttonsContainer}>
      {currentStep > 1 && (
        <TouchableOpacity
          onPress={prevStep}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
      
      {currentStep < 3 ? (
        <TouchableOpacity
          onPress={handleNext}
          style={[
            styles.nextButton,
            currentStep <= 1 ? styles.fullWidthButton : null
          ]}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleProfileSubmit}
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor="#8b4ad3" barStyle="light-content" />
      <LinearGradient
        colors={['#8b4ad3', '#bc93ed']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Complete Your Profile</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {renderProgressBar()}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
          {renderButtons()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Progress bar
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#8b4ad3',
    fontWeight: 'bold',
  },
  inactiveLabel: {
    color: '#888888',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#f0e6ff',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b4ad3',
  },
  // Step container
  stepContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  // Input containers and labels
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    width: '100%',
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: '100%',
    color: '#333',
  },
  // Profile image
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#8b4ad3',
    overflow: 'hidden',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    color: '#8b4ad3',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Navigation buttons
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#f0e6ff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.45,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#8b4ad3',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#8b4ad3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.45,
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#8b4ad3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#8b4ad3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.45,
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#8b4ad3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#bc93ed',
    shadowOpacity: 0.1,
  },
  fullWidthButton: {
    flex: 1,
    marginLeft: 0,
  },
});

export default ProfileCompletionScreen;