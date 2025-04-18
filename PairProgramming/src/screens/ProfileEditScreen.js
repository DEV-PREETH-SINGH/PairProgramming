import { baseUrl } from "@env";
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { UserContext } from '../context/UserContext';
import { ChevronLeft, ChevronRight, User, Code, Clock, BookOpen, Target, Settings, LogOut } from 'lucide-react-native';

// Skeleton loading component
const SkeletonProfileEditScreen = () => {
  const { width } = Dimensions.get('window');
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    
    shimmerAnimation.start();
    
    return () => {
      shimmerAnimation.stop();
    };
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 2, width * 2],
  });
  
  // List of sections to show in the skeleton
  const sections = [
    { icon: User, title: 'Header Section' },
    { icon: Code, title: 'Basic Coding Info' },
    { icon: Target, title: 'Goals & Learning Path' },
    { icon: Settings, title: 'Preferences' },
    { icon: BookOpen, title: 'Additional Information' }
  ];

  return (
    <View style={styles.mainContainer}>
      {/* Skeleton top bar */}
      <View style={styles.topBar}>
        <View style={styles.skeletonBackButton}>
          <Animated.View
            style={[
              styles.shimmerOverlay,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          />
        </View>
        <View style={styles.skeletonHeading}>
          <Animated.View
            style={[
              styles.shimmerOverlay,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          />
        </View>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.sectionContainer}>
          {/* Skeleton Profile Preview */}
          <View style={styles.profilePreview}>
            <View style={styles.skeletonPreviewPic}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
            <View style={styles.skeletonUsername}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
          </View>
          
          {/* Skeleton Sections */}
          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionLeft}>
                <View style={styles.skeletonIcon}>
                  <Animated.View
                    style={[
                      styles.shimmerOverlay,
                      { transform: [{ translateX: shimmerTranslate }] },
                    ]}
                  />
                </View>
                <View style={styles.skeletonSectionTitle}>
                  <Animated.View
                    style={[
                      styles.shimmerOverlay,
                      { transform: [{ translateX: shimmerTranslate }] },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.skeletonChevron}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX: shimmerTranslate }] },
                  ]}
                />
              </View>
            </View>
          ))}
          
          {/* Skeleton Sign Out Button */}
          <View style={styles.skeletonSignOutButton}>
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const ProfileEditScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true); // Changed to default true to show skeleton loading
  
  // Profile data
  const [profileData, setProfileData] = useState({
    username: '',
    profilePic: null,
    preferredLanguage: '',
    preferredSolvingTime: '',
    dsaSheet: '',
    dailyProblems: '1',
    codingGoal: '',
    codingLevel: '',
    codingSpeed: '',
    solvePreference: '',
    partnerPreference: '',
    bio: ''
  });
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  const currentUserUID = auth().currentUser?.uid;

  useEffect(() => {
    if (!currentUserUID) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/user/${currentUserUID}`);
        console.log(response);
    
        // Destructuring the response data
        const { 
          username, 
          preferredLanguage, 
          preferredSolvingTime, 
          profilePic, 
          dsaSheet, 
          dailyProblems, 
          codingGoal, 
          codingLevel,
          codingSpeed, 
          solvePreference, 
          partnerPreference, 
          bio 
        } = response.data;
    
        // Updating state with the fetched data
        setProfileData(prev => ({
          ...prev,
          username: username || '',
          preferredLanguage: preferredLanguage || '',
          preferredSolvingTime: preferredSolvingTime || '',
          profilePic: profilePic || null, // Profile picture, null if not available
          dsaSheet: dsaSheet ,
          dailyProblems: dailyProblems || 0, // Default to 0 if not provided
          codingGoal: codingGoal || '',
          codingLevel: codingLevel || '',
          codingSpeed: codingSpeed || '',
          solvePreference: solvePreference || '',
          partnerPreference: partnerPreference || '',
          bio: bio || '' // Default empty string if no bio
        }));
    
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert('Error', 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };
    

    fetchUserData();
  }, [currentUserUID]);

  const selectImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error:', response.errorMessage);
      } else {
        setProfileData(prev => ({
          ...prev,
          profilePic: response.assets[0].uri
        }));
      }
    });
  };

  const handleUpdateProfile = async () => {
    if (!profileData.username || !profileData.preferredLanguage || !profileData.preferredSolvingTime) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('uid', currentUserUID);
      formData.append('username', profileData.username);
      formData.append('preferredLanguage', profileData.preferredLanguage);
      formData.append('preferredSolvingTime', profileData.preferredSolvingTime);
      
      // Append additional fields if your backend supports them
      formData.append('dsaSheet', profileData.dsaSheet || '');
      formData.append('dailyProblems', profileData.dailyProblems || '');
      formData.append('codingGoal', profileData.codingGoal || '');
      formData.append('codingLevel', profileData.codingLevel || '');
      formData.append('codingSpeed', profileData.codingSpeed || '');
      formData.append('solvePreference', profileData.solvePreference || '');
      formData.append('partnerPreference', profileData.partnerPreference || '');
      formData.append('bio', profileData.bio || '');

      // Check if profilePic is a string URL or a file object
      if (profileData.profilePic) {
        // If the profilePic is a new file (contains 'file://' in the URI)
        if (profileData.profilePic.startsWith('file://')) {
          // Get filename from path
          const fileName = profileData.profilePic.split('/').pop();
          
          formData.append('profilePic', {
            uri: profileData.profilePic,
            name: fileName || 'profile.jpg',
            type: 'image/jpeg',
          });
        } else if (!profileData.profilePic.includes(baseUrl)) {
          // It's a local image but not from the server - needs to be uploaded
          formData.append('profilePic', {
            uri: profileData.profilePic,
            name: 'profile.jpg',
            type: 'image/jpeg',
          });
        }
        // If it already contains the baseUrl, it's already on the server
        // No need to upload it again
      }

      console.log('Making update request to:', `${baseUrl}/update-profile`);
      
      // Add timeout to the request
      const response = await axios.put(`${baseUrl}/update-profile`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Update response:', response.status);
      
      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully');
        setModalVisible(false);
      } else {
        Alert.alert('Error', `Server returned status: ${response.status}`);
      }
      
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with an error status
        console.error('Server error data:', error.response.data);
        Alert.alert('Server Error', `Error code: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        Alert.alert('Network Error', 'No response from server. Please check your internet connection and try again.');
      } else {
        // Error in setting up the request
        Alert.alert('Error', 'There was a problem updating your profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const openSection = (section) => {
    setActiveSection(section);
    setModalVisible(true);
  };
  
  // Modal Content for each section
  const renderModalContent = () => {
    switch (activeSection) {
      case 'header':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Header Section</Text>
            
            <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
              {profileData.profilePic ? (
                <Image source={{ uri: profileData.profilePic }} style={styles.profilePic} />
              ) : (
                <View style={styles.profilePicPlaceholder}>
                  <User size={40} color="#999" />
                </View>
              )}
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
            
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={profileData.username}
              onChangeText={(text) => setProfileData(prev => ({...prev, username: text}))}
              placeholder="Your username"
              placeholderTextColor="#888"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'basicInfo':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Basic Information</Text>
            
            <Text style={styles.inputLabel}>What's your main programming language?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.preferredLanguage}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, preferredLanguage: value}))}
              >
                <Picker.Item label="Select a language" value="" />
                <Picker.Item label="Python" value="Python" />
                <Picker.Item label="Java" value="Java" />
                <Picker.Item label="C++" value="C++" />
                <Picker.Item label="JavaScript" value="JavaScript" />
                <Picker.Item label="C" value="C" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            
            <Text style={styles.inputLabel}>When do you usually code?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.preferredSolvingTime}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, preferredSolvingTime: value}))}
              >
                <Picker.Item label="Select a time" value="" />
                <Picker.Item label="Morning" value="Morning" />
                <Picker.Item label="Afternoon" value="Afternoon" />
                <Picker.Item label="Evening" value="Evening" />
                <Picker.Item label="Late Night" value="Late Night" />
                <Picker.Item label="Anytime" value="Anytime" />
              </Picker>
            </View>
            
            <Text style={styles.inputLabel}>Which DSA sheet are you following?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.dsaSheet}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, dsaSheet: value}))}
              >
                <Picker.Item label="Select a DSA sheet" value="" />
                <Picker.Item label="Blind75" value="Blind75" />
                <Picker.Item label="NeetCode" value="NeetCode" />
                <Picker.Item label="Striver SDE Sheet" value="Striver's Guide" />
                <Picker.Item label="LeetCode Top 100" value="LeetCode Top 100" />
                <Picker.Item label="My Own Path" value="My Own Path" />
              </Picker>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'goals':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Goal Section</Text>
            
            <Text style={styles.inputLabel}>How many problems do you want to solve per day?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.dailyProblems}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, dailyProblems: value}))}
              >
                <Picker.Item label="1 problem" value="1" />
                <Picker.Item label="2 problems" value="2" />
                <Picker.Item label="3 problems" value="3" />
                <Picker.Item label="4 problems" value="4" />
                <Picker.Item label="5+ problems" value="5+" />
              </Picker>
            </View>
            
            <Text style={styles.inputLabel}>What's your ultimate coding goal?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.codingGoal}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, codingGoal: value}))}
              >
                <Picker.Item label="Select a goal" value="" />
                <Picker.Item label="FAANG interviews" value="FAANG interviews" />
                <Picker.Item label="Competitive Programming" value="Competitive Programming" />
                <Picker.Item label="DSA mastery" value="DSA mastery" />
                <Picker.Item label="Coding for fun" value="Coding for fun" />
                <Picker.Item label="Just here to learn!" value="Just learning" />
              </Picker>
            </View>
            
            <Text style={styles.inputLabel}>What's your current coding level?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.codingLevel}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, codingLevel: value}))}
              >
                <Picker.Item label="Select your level" value="" />
                <Picker.Item label="Beginner" value="Beginner" />
                <Picker.Item label="Intermediate" value="Intermediate" />
                <Picker.Item label="Expert" value="Expert" />
              </Picker>
            </View>

            <Text style={styles.inputLabel}>What's your preferred coding speed?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.codingSpeed}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, codingSpeed: value}))}
              >
                <Picker.Item label="Select your speed" value="" />
                <Picker.Item label="Lightning Fast" value="Lightning Fast" />
                <Picker.Item label="Steady and Fast" value="Steady and Fast" />
                <Picker.Item label="Thorough & Detailed" value="Thorough & Detailed" />
                <Picker.Item label="Take My Time" value="Take My Time" />
              </Picker>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'preferences':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Preferences Section</Text>
            
            <Text style={styles.inputLabel}>How do you prefer to solve problems with a partner?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.solvePreference}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, solvePreference: value}))}
              >
                <Picker.Item label="Select your preference" value="" />
                <Picker.Item label="Real-Time Together" value="Real-time" />
                <Picker.Item label="Separate & Discuss Later" value="Separately" />
                <Picker.Item label="Either Way" value="Either" />
              </Picker>
            </View>
            
            <Text style={styles.inputLabel}>What are you looking for in a coding partner?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profileData.partnerPreference}
                style={styles.picker}
                onValueChange={(value) => setProfileData(prev => ({...prev, partnerPreference: value}))}
                
              >
                <Picker.Item label="Select your expectation" value="" />
                <Picker.Item label="Support & Motivation" value="Support & Motivation" />
                <Picker.Item label="Healthy Competition" value="Healthy Competition" />
                <Picker.Item label="Both" value="Both" />
              </Picker>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'additional':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Additional Information</Text>
            
            <Text style={styles.inputLabel}>Tell us a little about yourself</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData(prev => ({...prev, bio: text}))}
              placeholder="E.g., Currently preparing for coding interviews. Love solving algorithmic challenges!"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.mainContainer}>
      {loading ? (
        <SkeletonProfileEditScreen />
      ) : (
        <>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.heading}>Edit Profile</Text>
          </View>
          
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.sectionContainer}>
              {/* Profile Preview */}
              <View style={styles.profilePreview}>
                {profileData.profilePic ? (
                  <Image source={{ uri: profileData.profilePic }} style={styles.previewPic} />
                ) : (
                  <View style={styles.previewPicPlaceholder}>
                    <User size={30} color="#999" />
                  </View>
                )}
                <Text style={styles.previewUsername}>{profileData.username || 'Username'}</Text>
              </View>
              
              {/* Sections */}
              <TouchableOpacity style={styles.section} onPress={() => openSection('header')}>
                <View style={styles.sectionLeft}>
                  <User size={22} color="black" />
                  <Text style={styles.sectionTitle}>Header Section</Text>
                </View>
                <ChevronRight size={20} color="black" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.section} onPress={() => openSection('basicInfo')}>
                <View style={styles.sectionLeft}>
                  <Code size={22} color="black" />
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                </View>
                <ChevronRight size={20} color="black" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.section} onPress={() => openSection('goals')}>
                <View style={styles.sectionLeft}>
                  <Target size={22} color="black" />
                  <Text style={styles.sectionTitle}>Goal Section</Text>
                </View>
                <ChevronRight size={20} color="black" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.section} onPress={() => openSection('preferences')}>
                <View style={styles.sectionLeft}>
                  <Settings size={22} color="black" />
                  <Text style={styles.sectionTitle}>Preferences Section</Text>
                </View>
                <ChevronRight size={20} color="black" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.section} onPress={() => openSection('additional')}>
                <View style={styles.sectionLeft}>
                  <BookOpen size={22} color="black" />
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                </View>
                <ChevronRight size={20} color="black" />
              </TouchableOpacity>
              
              {/* Sign Out Button */}
              <TouchableOpacity 
                style={styles.signOutButton} 
                onPress={() => {
                  auth().signOut();
                  navigation.replace('Login');
                }}
              >
                <LogOut size={20} color="red" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Modal for editing sections */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <ChevronLeft size={24} color="#333" />
                </TouchableOpacity>
                {renderModalContent()}
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eaeaea',
    backgroundColor: "white",
  },
  backButton: {
    padding: 5,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    padding: 15,
  },
  profilePreview: {
    alignItems: 'center',
    marginVertical: 20,
  },
  previewPic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  previewPicPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewUsername: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d5bdf5',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    // elevation: 1,
    // shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    marginLeft: 12,
    color: 'black',
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'red',
    borderWidth: 1,
  },
  signOutText: {
    color: 'red',
    fontWeight: '600',
    marginLeft: 10,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    height: '90%',
  },
  modalCloseButton: {
    padding: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  modalContent: {
    padding: 20,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: 'black',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: 'black',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#d5bdf5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'black',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
  
  // Image container in modal
  imageContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profilePicPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#8b4ad3',
    marginTop: 5,
  },
  
  // Skeleton loading styles
  shimmerOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  skeletonBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonHeading: {
    width: 120,
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 15,
  },
  skeletonPreviewPic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    overflow: 'hidden',
  },
  skeletonUsername: {
    width: 120,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonIcon: {
    width: 22,
    height: 22,
    backgroundColor: '#c5aee5',
    borderRadius: 11,
    overflow: 'hidden',
  },
  skeletonSectionTitle: {
    width: 120,
    height: 16,
    backgroundColor: '#c5aee5',
    borderRadius: 4,
    marginLeft: 12,
    overflow: 'hidden',
  },
  skeletonChevron: {
    width: 20,
    height: 20,
    backgroundColor: '#c5aee5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  skeletonSignOutButton: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 20,
    borderColor: '#ffdddd',
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default ProfileEditScreen;