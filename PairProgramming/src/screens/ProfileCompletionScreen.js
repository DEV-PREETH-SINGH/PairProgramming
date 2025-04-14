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
  Platform
} from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileCompletionScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const currentUser = auth().currentUser;
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Profile picture state
  const [profilePic, setProfilePic] = useState(null);
  
  // Step 1: Personal Info & Preferences
  const [username, setUsername] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [otherLanguage, setOtherLanguage] = useState('');
  const [preferredSolvingTime, setPreferredSolvingTime] = useState('');
  const [dsaSheet, setDsaSheet] = useState('');
  const [otherDsaSheet, setOtherDsaSheet] = useState('');
  const [dailyProblems, setDailyProblems] = useState('');
  const [customDailyProblems, setCustomDailyProblems] = useState('');
  
  // Step 2: Goals & Preferences
  const [codingGoal, setCodingGoal] = useState('');
  const [codingLevel, setCodingLevel] = useState('');
  const [codingSpeed, setCodingSpeed] = useState('');
  
  // Step 3: Matching Preferences
  const [solvePreference, setSolvePreference] = useState('');
  const [partnerPreference, setPartnerPreference] = useState('');
  
  // Step 4: Bio
  const [bio, setBio] = useState('');
  const [leetcodeProfileId, setLeetcodeProfileId] = useState('');

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
    if (currentStep < 4) {
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
        if (!username) return "Please enter your username";
        if (!preferredLanguage) return "Please select your preferred coding language";
        if (preferredLanguage === 'Other' && !otherLanguage) return "Please specify your coding language";
        if (!preferredSolvingTime) return "Please select your preferred coding time";
        if (!dsaSheet) return "Please select a DSA sheet";
        if (dsaSheet === 'Other' && !otherDsaSheet) return "Please specify your DSA sheet";
        if (!dailyProblems) return "Please select how many problems you want to solve daily";
        if (dailyProblems === 'Custom' && !customDailyProblems) return "Please specify how many problems";
        break;
      case 2:
        if (!codingGoal) return "Please select your coding goal";
        if (!codingLevel) return "Please select your coding level";
        if (!codingSpeed) return "Please select your preferred coding speed";
        break;
      case 3:
        if (!solvePreference) return "Please select how you want to solve problems";
        if (!partnerPreference) return "Please select what you're looking for in a partner";
        break;
      case 4:
        if (!bio) return "Please write a short bio";
        if (!leetcodeProfileId) return "Please enter your Leetcode Profile ID";
        if (!profilePic) return "Please select a profile picture";
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
      
      // Step 1 data
      formData.append('preferredLanguage', preferredLanguage === 'Other' ? otherLanguage : preferredLanguage);
      formData.append('preferredSolvingTime', preferredSolvingTime);
      formData.append('dsaSheet', dsaSheet === 'Other' ? otherDsaSheet : dsaSheet);
      formData.append('dailyProblems', dailyProblems === 'Custom' ? customDailyProblems : dailyProblems);
      
      // Step 2 data
      formData.append('codingGoal', codingGoal);
      formData.append('codingLevel', codingLevel);
      formData.append('codingSpeed', codingSpeed);
      
      // Step 3 data
      formData.append('solvePreference', solvePreference);
      formData.append('partnerPreference', partnerPreference);
      
      // Step 4 data
      formData.append('bio', bio);
      formData.append('leetcodeProfileId', leetcodeProfileId);

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
    const totalSteps = 4;
    const progressWidth = (currentStep / totalSteps) * 100;
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressLabels}>
          {[1, 2, 3, 4].map((step) => (
            <Text 
              key={step} 
              style={[
                styles.progressLabel, 
                currentStep >= step ? styles.activeLabel : styles.inactiveLabel
              ]}
            >
              {step === 1 && "Personal Info"}
              {step === 2 && "Goals & Skills"}
              {step === 3 && "Matching"}
              {step === 4 && "Bio & Finish"}
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
            <Text style={styles.stepTitle}>Step 1: Getting Started - Personal Info & Preferences</Text>
            
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#888"
            />

            <Text style={styles.questionText}>What's your coding language of choice?</Text>
           
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
            
            {preferredLanguage === 'Other' && (
              <TextInput
                style={styles.input}
                value={otherLanguage}
                onChangeText={setOtherLanguage}
                placeholder="Specify your language"
                placeholderTextColor="#888"
              />
            )}

            <Text style={styles.questionText}>When do you typically code?</Text>
            
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

            <Text style={styles.questionText}>Which DSA sheet are you currently working on?</Text>
            
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
            
            {dsaSheet === 'Other' && (
              <TextInput
                style={styles.input}
                value={otherDsaSheet}
                onChangeText={setOtherDsaSheet}
                placeholder="Specify your DSA sheet"
                placeholderTextColor="#888"
              />
            )}

            <Text style={styles.questionText}>How many problems do you want to solve each day?</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={dailyProblems}
                style={styles.picker}
                onValueChange={setDailyProblems}
              >
                <Picker.Item label="Select Daily Problems" value="" />
                <Picker.Item label="1️⃣" value="1" />
                <Picker.Item label="2️⃣" value="2" />
                <Picker.Item label="3️⃣" value="3" />
                <Picker.Item label="4️⃣" value="4" />
                <Picker.Item label="5️⃣+" value="5+" />
                <Picker.Item label="Custom" value="Custom" />
              </Picker>
            </View>
            
            {dailyProblems === 'Custom' && (
              <TextInput
                style={styles.input}
                value={customDailyProblems}
                onChangeText={setCustomDailyProblems}
                placeholder="How many problems?"
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            )}
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2: Your Goals & Preferences</Text>
            
            <Text style={styles.questionText}>What's your ultimate coding goal?</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={codingGoal}
                style={styles.picker}
                onValueChange={setCodingGoal}
              >
                <Picker.Item label="Select Your Coding Goal" value="" />
                <Picker.Item label="FAANG interviews 🏢" value="FAANG interviews" />
                <Picker.Item label="Competitive Programming 🏆" value="Competitive Programming" />
                <Picker.Item label="DSA Mastery 🧠" value="DSA Mastery" />
                <Picker.Item label="Coding for fun 🎮" value="Coding for fun" />
                <Picker.Item label="Just here to learn!" value="Just learning" />
              </Picker>
            </View>

            <Text style={styles.questionText}>What's your current coding level?</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={codingLevel}
                style={styles.picker}
                onValueChange={setCodingLevel}
              >
                <Picker.Item label="Select Your Coding Level" value="" />
                <Picker.Item label="Beginner 👶" value="Beginner" />
                <Picker.Item label="Intermediate 🚀" value="Intermediate" />
                <Picker.Item label="Expert 🏆" value="Expert" />
              </Picker>
            </View>

            <Text style={styles.questionText}>What's your preferred coding speed?</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={codingSpeed}
                style={styles.picker}
                onValueChange={setCodingSpeed}
              >
                <Picker.Item label="Select Your Coding Speed" value="" />
                <Picker.Item label="Lightning Fast ⚡" value="Lightning Fast" />
                <Picker.Item label="Steady and Fast 🚀" value="Steady and Fast" />
                <Picker.Item label="Thorough & Detailed 🧠" value="Thorough & Detailed" />
                <Picker.Item label="Take My Time 🕰️" value="Take My Time" />
              </Picker>
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3: Matching Preferences</Text>
            
            <Text style={styles.questionText}>How do you want to solve problems with your partner?</Text>
            <Text style={styles.subText}>
              Would you like to solve problems in real-time together or separately? Let us know your style.
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={solvePreference}
                style={styles.picker}
                onValueChange={setSolvePreference}
              >
                <Picker.Item label="Select Your Preferred Approach" value="" />
                <Picker.Item label="Solving Together in Real-time 🤝" value="Real-time" />
                <Picker.Item label="Solving Separately and Discussing Later 💬" value="Separately" />
                <Picker.Item label="Either way 🎯" value="Either" />
              </Picker>
            </View>

            <Text style={styles.questionText}>What are you looking for in a coding partner?</Text>
            <Text style={styles.subText}>
              Are you looking for motivation, friendly competition, or a mix of both?
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={partnerPreference}
                style={styles.picker}
                onValueChange={setPartnerPreference}
              >
                <Picker.Item label="Select What You're Looking For" value="" />
                <Picker.Item label="Support & Motivation 💪" value="Support & Motivation" />
                <Picker.Item label="Healthy Competition 🏁" value="Healthy Competition" />
                <Picker.Item label="Both – Let's Code! 🔥" value="Both" />
              </Picker>
            </View>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 4: Final Bio Setup</Text>
            
            <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
              {profilePic ? (
                <Image source={{ uri: profilePic.uri }} style={styles.profilePic} />
              ) : (
                <Text style={styles.imagePlaceholder}>Select Profile Picture</Text>
              )}
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={leetcodeProfileId}
              onChangeText={setLeetcodeProfileId}
              placeholder="Leetcode Profile ID"
              placeholderTextColor="#888"
            />
            
            <Text style={styles.questionText}>Bio Description</Text>
            <Text style={styles.subText}>
              Share a little more about yourself – any special interests or projects you're working on?
            </Text>
            <TextInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
            />
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
      
      {currentStep < 4 ? (
        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
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
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7ff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  // Progress bar
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#000000',
    fontWeight: 'bold',
  },
  inactiveLabel: {
    color: '#888888',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
  },
  // Step container - now blending with background
  stepContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  // Form elements
  input: {
    width: '100%',
    height: 55,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    width: '100%',
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    paddingTop: 15,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  pickerContainer: {
    width: '100%',
    height: 55,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: '100%',
    color: '#333',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholder: {
    color: '#555',
    textAlign: 'center',
    padding: 10,
  },
  // Navigation buttons
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
});

export default ProfileCompletionScreen;