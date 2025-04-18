import {baseUrl} from "@env";
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Platform, ScrollView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Swiper from 'react-native-deck-swiper';
import { ChevronLeft, MessageCircle, Code, Star, Zap, Clock, Users } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get('window');

// Skeleton component for user card
const SkeletonUserCard = () => {
  // Animation value for shimmer effect
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

  // Interpolate for shimmer animation
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 2, width * 2],
  });

  return (
    <View style={styles.userCard}>
      {/* Skeleton for profile picture */}
      <View style={styles.skeletonProfileWrapper}>
        <View style={styles.skeletonProfilePic}>
          <Animated.View
            style={[
              styles.shimmerOverlay,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          />
        </View>
        
        {/* Skeleton gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(118, 56, 184, 0.8)']}
          style={styles.gradientOverlay}
        />
      </View>
      
      {/* Skeleton for info container */}
      <View style={styles.infoContainer}>
        {/* Skeleton username */}
        <View style={styles.skeletonUsername}>
          <Animated.View
            style={[
              styles.shimmerOverlay,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          />
        </View>
        
        {/* Skeleton metadata grid */}
        <View style={styles.metadataGrid}>
          {/* Row 1 */}
          <View style={styles.metadataRow}>
            <View style={styles.skeletonMetadataItem}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
            
            <View style={styles.skeletonMetadataItem}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
          </View>
          
          {/* Row 2 */}
          <View style={styles.metadataRow}>
            <View style={styles.skeletonMetadataItem}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
            
            <View style={styles.skeletonMetadataItem}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
            
            <View style={styles.skeletonMetadataItem}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);
  const [key, setKey] = useState(Date.now()); // Key to force remount swiper

  // Use useFocusEffect for operations that should run when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused - calling APIs");
      
      // Call start-today API and fetch users when screen is focused
      const setupScreen = async () => {
        setLoading(true);
        try {
          const currentUserUID = auth().currentUser?.uid;
          if (!currentUserUID) {
            console.error('No user is currently logged in');
            setLoading(false);
            return;
          }
          
          // Call start-today API
          await axios.post(`${baseUrl}/start-today`, {
            uid: currentUserUID
          });
          
          // Fetch users
          const response = await axios.get(`${baseUrl}/get-users?uid=${currentUserUID}`);
          console.log(`Fetched ${response.data.users?.length || 0} users`);
          setUsers(response.data.users || []);
          
          // Force swiper to remount with fresh data
          setKey(Date.now());
        } catch (error) {
          console.error('Error setting up screen:', error);
          setError('Error loading user list');
        } finally {
          setLoading(false);
        }
      };
      
      setupScreen();
      
      // Cleanup function
      return () => {
        // Any cleanup needed
      };
    }, []) // Empty dependency array means this runs on every focus
  );

  const handleChatPress = (otherUserUID) => {
    navigation.navigate('Chat', { otherUserUID });
  };

  const handleSwipedRight = (index) => {
    if (users[index]) {
      const user = users[index];
      handleChatPress(user.uid);
    }
  };

  const handleSwipedLeft = (index) => {
    // Just logging or additional logic for left swipe if needed
    console.log(`Swiped left on user at index ${index}`);
  };

  // Handle when all cards are swiped
  const handleAllSwiped = () => {
    console.log("All cards swiped");
    if (swiperRef.current && users.length > 0) {
      swiperRef.current.jumpToCardIndex(0);
    }
  };

  // Utility function to truncate text if too long
  const truncateText = (text, maxLength = 15) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Render content based on loading/error/empty states
  const renderContent = () => {
    if (loading) {
      return <SkeletonUserCard />;
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!users || users.length === 0) {
      return (
        <View style={styles.noUsersContainer}>
          <LinearGradient
            colors={['#bc93ed', '#8b4ad3']}
            style={styles.emptyStateCard}
          >
            <Image source={require('../assets/No_user.jpg')} style={styles.emptyImage} />
            
            <Text style={styles.emptyStateTitle}>No Coding Partners Yet!</Text>
            
            <Text style={styles.emptyStateText}>
              We couldn't find any coding buddies for you today.
            </Text>
            
            <Text style={styles.emptyStateText}>
              Try changing your preferences to find more matches.
            </Text>
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('ProfileEditScreen')}
            >
              <Text style={styles.editProfileButtonText}>Edit Preferences</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    return (
      <Swiper
        key={key} // Force remount when key changes
        ref={swiperRef}
        cards={users}
        renderCard={(user) => (
          <View style={styles.userCard}>
            {/* Profile Picture with Gradient Effect */}
            <View style={styles.profilePicWrapper}>
              <Image
                source={{ uri: user.profilePic || 'https://i.pinimg.com/736x/44/84/b6/4484b675ec3d56549907807fccf75b81.jpg' }}
                style={styles.profilePic}
              />
              {/* Gradient applied at the bottom of the image */}
              <LinearGradient
                colors={['transparent', 'rgba(118, 56, 184, 0.8)']}
                style={styles.gradientOverlay}
              />
            </View>

            {/* User info container - now includes metadata */}
            <View style={styles.infoContainer}>
              {/* Username */}
              <Text style={styles.userName}>{user.username}</Text>
              
              {/* Metadata Grid */}
              <View style={styles.metadataGrid}>
                {/* Row 1 */}
                <View style={styles.metadataRow}>
                  <View style={styles.metadataItem}>
                    <Code size={14} color="white" />
                    <Text style={styles.metadataText}>
                      {truncateText(user.codingLevel) || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.metadataItem}>
                    <Zap size={14} color="white" />
                    <Text style={styles.metadataText}>
                      {truncateText(user.codingSpeed) || 'N/A'}
                    </Text>
                  </View>
                </View>
                
                {/* Row 2 */}
                <View style={styles.metadataRow}>
                  <View style={styles.metadataItem}>
                    <Star size={14} color="white" />
                    <Text style={styles.metadataText}>
                      {truncateText(user.solvePreference) || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.metadataItem}>
                    <Users size={14} color="white" />
                    <Text style={styles.metadataText}>
                      {truncateText(user.partnerPreference) || 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.metadataItem}>
                    <MessageCircle size={14} color="white" />
                    <Text style={styles.metadataText}>
                      {truncateText(user.bio, 20) || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        onSwipedRight={handleSwipedRight}
        onSwipedLeft={handleSwipedLeft}
        onSwipedAll={handleAllSwiped}
        cardIndex={0}
        backgroundColor={'transparent'}
        stackSize={3}
        infinite={true}
        disableTopSwipe={true}
        disableBottomSwipe={true}
        verticalSwipe={false}
        useViewOverflow={Platform.OS === 'ios'}
        cardVerticalMargin={80}
        cardHorizontalMargin={0}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.topBar}>
        <ChevronLeft size={30} color="#aaa" onPress={() => navigation.goBack()} />
        <Text style={styles.heading}>CodeBuddies for Today</Text>
      </View> */}

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7638b8',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  userCard: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
    borderRadius: 10,
    marginTop: -40,
  },
  profilePicWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%', // Increased height to accommodate metadata
    borderRadius: 10,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 15,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metadataGrid: {
    width: '100%',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  metadataText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  noUsersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUsersText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  emptyStateCard: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    width: '90%',
    //elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: 'white',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  // Skeleton styles
  skeletonProfileWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonProfilePic: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  skeletonUsername: {
    height: 24,
    width: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  skeletonMetadataItem: {
    height: 18,
    width: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 5,
    marginRight: 8,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  editProfileButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 25,
    //elevation: 2,
    //shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b4ad3',
  },
});

export default UserListScreen;

//going to work on 5)