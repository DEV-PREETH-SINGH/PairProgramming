import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, RefreshControl } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import axios from "axios";
import auth from "@react-native-firebase/auth";
import { LineChart } from "react-native-chart-kit";
import { House, MessageCircle, UserRoundPen } from "lucide-react-native";
import ChatListScreen from "./ChatListScreen";
import { baseUrl } from "@env";
import UserListScreen from "./UserListScreen";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { ProgressBar } from 'react-native-paper';
import LinearGradient from "react-native-linear-gradient";

const Tab = createBottomTabNavigator();
const windowWidth = Dimensions.get("window").width;
//npx react-native start --reset-cache

//npx react-native run-android
// Custom circular progress component
const CircularProgress = ({ percentage, size, strokeWidth, text, color = "#AD7BFF" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.circularProgressContainer}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f2ebfc"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8b4ad3"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
        
        {/* Text in the middle */}
        <SvgText
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          fill="#000"
          fontSize={size / 7}
          fontWeight="bold"
        >
          {text}
        </SvgText>
        
        <SvgText
          x={size / 2}
          y={size / 2 + 20}
          textAnchor="middle"
          fill="#000"
          fontSize={size / 7}
          fontWeight="normal"
        >
          Solved
        </SvgText>
      </Svg>
      <Text style={styles.percentageText}>{percentage}%</Text>
    </View>
  );
};

// Skeleton component for home screen
const SkeletonHomeScreen = () => {
  // Animation value for shimmer effect
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

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
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* First Section: Stats Card and Overall Progress */}
        <View style={styles.topRowContainer}>
          {/* LeetCode Stats Card - using the same gradient colors */}
          <View style={styles.leftColumn}>
            <LinearGradient
              colors={['#8b4ad3', '#bc93ed']}
              style={styles.statsCard}
            >
              <View style={styles.skeletonCardTitle}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX: shimmerTranslate }] },
                  ]}
                />
              </View>
              
              {/* Skeleton stat rows with same layout as actual content */}
              {[1, 2, 3, 4].map((item) => (
                <View key={`stat-${item}`} style={styles.statRow}>
                  <View style={styles.skeletonStatLabel}>
                    <Animated.View
                      style={[
                        styles.shimmerOverlay,
                        { transform: [{ translateX: shimmerTranslate }] },
                      ]}
                    />
                  </View>
                  <View style={styles.skeletonStatValue}>
                    <Animated.View
                      style={[
                        styles.shimmerOverlay,
                        { transform: [{ translateX: shimmerTranslate }] },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </LinearGradient>
          </View>
          
          {/* Skeleton Circular Progress with matching colors */}
          <View style={styles.rightColumn}>
            <View style={styles.skeletonCircle}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
            <View style={styles.skeletonPercentText}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
          </View>
        </View>
        
        {/* Skeleton Chart with border matching real chart */}
        <View style={styles.chartContainer}>
          <View style={styles.skeletonChartInner}>
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />
          </View>
        </View>
        
        {/* Bottom Section - Striver DSA Progress and Difficulty Breakdown */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomRow}>
            {/* Skeleton Striver Progress - matching circle size and colors */}
            <View style={styles.striverProgressContainer}>
              <View style={[styles.skeletonCircle, { backgroundColor: '#e0f0f0' }]}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX: shimmerTranslate }] },
                  ]}
                />
              </View>
              <View style={styles.skeletonPercentText}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX: shimmerTranslate }] },
                  ]}
                />
              </View>
            </View>
            
            {/* Skeleton Difficulty Breakdown with matching progress bar sizes and colors */}
            <View style={styles.difficultyBreakdownContainer}>
              <View style={{ paddingLeft: 10, paddingTop: 20 }}>
                {/* Skeleton for each difficulty level progress bar */}
                {['Easy', 'Medium', 'Hard'].map((level, index) => (
                  <View key={`progress-${index}`} style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>{level}:</Text>
                    <View style={styles.progressBarWrapper}>
                      <View 
                        style={[
                          styles.skeletonProgressBar, 
                          { 
                            width: `${30 + (index * 20)}%`,
                            backgroundColor: '#e0f0f0'
                          }
                        ]}
                      >
                        <Animated.View
                          style={[
                            styles.shimmerOverlay,
                            { transform: [{ translateX: shimmerTranslate }] },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const HomeScreen = ({ navigation }) => {
  const [uid, setUid] = useState("Guest");
  const [leetcodeProgress, setLeetcodeProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUid(user.uid || "Guest");
    }

    // Fetch LeetCode progress
    if (user) {
      fetchLeetcodeProgress(user.uid);
    }
  }, []);

  // Add focus listener to reload data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if we're returning from DSASheetList
      const user = auth().currentUser;
      if (user) {
        fetchLeetcodeProgress(user.uid);
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, [navigation]);

  const fetchLeetcodeProgress = async (userId) => {
    try {
      setLoadingProgress(true);
      const response = await axios.get(`${baseUrl}/get-progress/${userId}`);
      setLeetcodeProgress(response.data);
      setLoadingProgress(false);
    } catch (error) {
      console.error("Error fetching LeetCode progress:", error);
      setLoadingProgress(false);
    }
  };

  const prepareChartData = (submissionCalendar) => {
    const labels = [];
    const data = [];
    
    // Get current date and date from 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // -6 to include today (total 7 days)
    
    // Create array of last 7 days (in timestamp format)
    const lastSevenDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sevenDaysAgo);
      day.setDate(sevenDaysAgo.getDate() + i);
      // Convert to start of day in seconds (Unix timestamp format)
      const dayTimestamp = Math.floor(day.setHours(0, 0, 0, 0) / 1000);
      lastSevenDays.push(dayTimestamp);
    }

    // Debug the calendar data in console
    console.log("Submission Calendar:", submissionCalendar);
    
    // Map submissions to the correct days
    for (const dayTimestamp of lastSevenDays) {
      const date = new Date(dayTimestamp * 1000);
      const day = date.toLocaleDateString(undefined, { weekday: 'short' });
      labels.push(day);
      
      // Find if there's a submission entry for this day
      // Using actual date comparison instead of timestamp division
      let submissionValue = 0;
      
      Object.entries(submissionCalendar).forEach(([timestamp, count]) => {
        const submissionDate = new Date(parseInt(timestamp) * 1000);
        const currentLoopDate = new Date(dayTimestamp * 1000);
        
        if (submissionDate.getDate() === currentLoopDate.getDate() && 
            submissionDate.getMonth() === currentLoopDate.getMonth()) {
          // If month and day match, consider it a match (ignore year)
          submissionValue = count;
        }
      });
      
      // Add the submission count or 0 if no submission
      data.push(submissionValue);
    }
    
    return { labels, data };
  };

  // Calculate total questions
  const calculateTotalQuestions = (data) => {
    if (!data) return 0;
    return data.totalEasy + data.totalMedium + data.totalHard;
  };

  // Calculate percentage
  const calculatePercentage = (solved, total) => {
    if (!solved || !total) return 0;
    return Math.round((solved / total) * 100);
  };

  const HomeContent = () => {
    const [refreshing, setRefreshing] = useState(false);
    
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      const user = auth().currentUser;
      if (user) {
        fetchLeetcodeProgress(user.uid)
          .then(() => setRefreshing(false))
          .catch(() => setRefreshing(false));
      } else {
        setRefreshing(false);
      }
    }, []);
    
    return (
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8b4ad3"]} 
            tintColor="#8b4ad3"
          />
        }
      >
        <View style={styles.container}>
          
          {loadingProgress ? (
            <SkeletonHomeScreen />
          ) : leetcodeProgress ? (
            <>
              {/* First Section: Stats Card and Overall Progress */}
              <View style={styles.topRowContainer}>
                {/* LeetCode Stats Card */}
                <View style={styles.leftColumn}>
                  {/* <View style={styles.statsCard}> */}
                  <LinearGradient
        colors={['#8b4ad3', '#bc93ed']}  // Gradient colors
        style={styles.statsCard}
      >
                    <Text style={styles.cardTitle}>Leetcode</Text>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Total Submissions:</Text>
                      <Text style={styles.statValue}>{leetcodeProgress.totalSubmissions[0].submissions || 0}</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Ranking:</Text>
                      <Text style={styles.statValue}>{leetcodeProgress.ranking?.toLocaleString() || "N/A"}</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Contribution Points:</Text>
                      <Text style={styles.statValue}>{leetcodeProgress.contributionPoint || 0}</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Reputation:</Text>
                      <Text style={styles.statValue}>{leetcodeProgress.reputation || 0}</Text>
                    </View>
                    </LinearGradient>
                </View>
                
                {/* Overall Progress Circle */}
                <View style={styles.rightColumn}>
                  <CircularProgress
                    percentage={calculatePercentage(
                      leetcodeProgress.solvedQuestions,
                      calculateTotalQuestions(leetcodeProgress)
                    )}
                    size={140}
                    strokeWidth={15}
                    text={`${leetcodeProgress.solvedQuestions || 0}/${calculateTotalQuestions(leetcodeProgress)}`}
                    color="#AD7BFF"
                  />
                </View>
              </View>
              
              {/* Weekly Progress Section - Full Width */}
              <View style={styles.sectionContainer}>
                {leetcodeProgress.submissionCalendar ? (
                  <View style={styles.chartContainer}>
                    
                    <LineChart
                      data={{
                        labels: prepareChartData(leetcodeProgress.submissionCalendar).labels,
                        datasets: [
                          {
                            data: prepareChartData(leetcodeProgress.submissionCalendar).data,
                          },
                        ],
                      }}
                      width={windowWidth - 50}
                      height={160}
                      chartConfig={{
                        backgroundColor: "transparent",
                        backgroundGradientFrom: "#white",
                        backgroundGradientTo: "white",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(188, 147, 237, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: "3",
                          strokeWidth: "1",
                          stroke: "#8b4ad3",
                        },
                        fillShadowGradient: "rgb(255, 255, 255)",
                        fillShadowGradientOpacity: 0.6,
                      }}
                      bezier
                      style={styles.chart}
                      withInnerLines={false}
                      withOuterLines={false}
                      withVerticalLines={false}
                      withHorizontalLines={false}
                    />
                    
                  </View>
                ) : (
                  <View style={styles.chartContainer}>
                    
                    <View style={styles.noDataChartContainer}>
                      <Text style={styles.noDataText}>No submissions this week</Text>
                      <Text style={styles.refreshHint}>Pull down to refresh submissions</Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Bottom Section - Striver DSA Progress and Difficulty Breakdown */}
              <View style={styles.bottomSection}>
                <View style={styles.bottomRow}>
                  {/* Striver DSA Progress */}
                  <TouchableOpacity 
                    style={styles.striverProgressContainer}
                    onPress={() => navigation.navigate('DSASheetList')}
                  >
                    <CircularProgress
                      percentage={parseFloat(leetcodeProgress.striverDSAProgress?.progressPercentage || 0)}
                      size={140}
                      strokeWidth={15}
                      text={`${leetcodeProgress.striverDSAProgress?.solvedCount2 || 0}/${leetcodeProgress.striverDSAProgress?.totalCount || 0}`}
                      color="#4BC0C0"
                    />
                  </TouchableOpacity>
                  
                  {/* Difficulty Breakdown */}
                  <View style={styles.difficultyBreakdownContainer}>
                    
                      {/* Striver DSA Progress */}
                      
                      {/* Easy Progress */}
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressLabel}>Easy:</Text>
                        <View style={styles.progressBarWrapper}>
                          <View style={[styles.customProgressBar, { width: `${leetcodeProgress.striverDSAProgress?.difficultyProgress?.easy?.percentage || 0}%`, backgroundColor: '#4BC0C0' }]}>
                            <Text style={styles.progressBarText}>
                              {leetcodeProgress.striverDSAProgress?.difficultyProgress?.easy?.solved || 0}/{leetcodeProgress.striverDSAProgress?.difficultyProgress?.easy?.total || 0} 
                              ({parseFloat(leetcodeProgress.striverDSAProgress?.difficultyProgress?.easy?.percentage || 0).toFixed(0)}%)
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Medium Progress */}
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressLabel}>Medium:</Text>
                        <View style={styles.progressBarWrapper}>
                          <View style={[styles.customProgressBar, { width: `${leetcodeProgress.striverDSAProgress?.difficultyProgress?.medium?.percentage || 0}%`, backgroundColor: '#FF9F40' }]}>
                            <Text style={styles.progressBarText}>
                              {leetcodeProgress.striverDSAProgress?.difficultyProgress?.medium?.solved || 0}/{leetcodeProgress.striverDSAProgress?.difficultyProgress?.medium?.total || 0} 
                              ({parseFloat(leetcodeProgress.striverDSAProgress?.difficultyProgress?.medium?.percentage || 0).toFixed(0)}%)
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Hard Progress */}
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressLabel}>Hard:</Text>
                        <View style={styles.progressBarWrapper}>
                          <View style={[styles.customProgressBar, { width: `${leetcodeProgress.striverDSAProgress?.difficultyProgress?.hard?.percentage || 0}%`, backgroundColor: '#FF6384' }]}>
                            <Text style={styles.progressBarText}>
                              {leetcodeProgress.striverDSAProgress?.difficultyProgress?.hard?.solved || 0}/{leetcodeProgress.striverDSAProgress?.difficultyProgress?.hard?.total || 0} 
                              ({parseFloat(leetcodeProgress.striverDSAProgress?.difficultyProgress?.hard?.percentage || 0).toFixed(0)}%)
                            </Text>
                          </View>
                        </View>
                      </View>
                    
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noProgressContainer}>
              <Text style={styles.noProgressTitle}>No LeetCode Progress Found</Text>
              <Text style={styles.noProgressText}>Please check your LeetCode ID in your profile settings</Text>
              <TouchableOpacity 
                style={styles.checkProfileButton}
                onPress={() => navigation.navigate('ProfileEditScreen')}
              >
                <Text style={styles.checkProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#ffffff',  // Color for active tab
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',  // Color for inactive tabs
          tabBarShowLabel: false,  // Hide labels
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginBottom: 5,
          },
        }}
      >
        {/* Reordered Tab Screens */}
        <Tab.Screen
          name="UserList"
          component={UserListScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ alignItems: 'center' }}>
                <UserRoundPen size={20} color={color} />
                {focused && <View style={styles.activeTabIndicator} />}
              </View>
            ),
            headerShown: false,
          }}
        />
  
        <Tab.Screen
          name="Home"
          component={HomeContent}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ alignItems: 'center' }}>
                <House size={20} color={color} />
                {focused && <View style={styles.activeTabIndicator} />}
              </View>
            ),
            headerShown: false,
          }}
        />
  
        <Tab.Screen
          name="Chats"
          component={ChatListScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ alignItems: 'center' }}>
                <MessageCircle size={20} color={color} />
                {focused && <View style={styles.activeTabIndicator} />}
              </View>
            ),
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </View>
  );
  
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    paddingBottom: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  // Top row with stats card and circular progress
  topRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  leftColumn: {
    width: "50%",
  },
  rightColumn: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  // Stats card styling
  statsCard: {
    backgroundColor: "#8b4ad3",
    borderRadius: 12,
    padding: 10,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#fff",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  // Weekly progress chart section
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
  },
chartContainer: {
  backgroundColor: "white",
  borderRadius: 16,
  padding: 0,
  borderWidth: 1,               // Thin border
  borderColor: "#d3d3d3",       // Light grey color
  // shadowColor: "#000",          // Shadow color
  // shadowOffset: { width: 0, height: 3 }, // Shadow only at the bottom
  // shadowOpacity: 0.08,          // Light shadow effect
  // shadowRadius: 4,              // Slight blur
  // elevation: 3,                 // Elevation for Android shadow effect
},

  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  // Bottom section - Striver DSA Progress
  bottomSection: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  // Circular progress common styles
  circularProgressContainer: {
    
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
    color: "#333",
  },
  // Info text
  noDataText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
// Tab navigation styling
tabBar: {
  backgroundColor: "#8b4ad3",  // Background color of the tab bar
  borderTopLeftRadius: 30,     // Curved left corner
  borderTopRightRadius: 30,    // Curved right corner
  height: 60,                  // Height of the tab bar
  paddingBottom: 5,  
  paddingTop: 10,  
  marginBottom: 0,          // Padding at the bottom
  overflow: 'hidden',          // Ensures content doesn't overflow beyond the curved corners
  elevation: 0,                // No elevation for shadow
},

  // Add these to your existing styles object
// Add these to your existing styles object
bottomRow: {
  flexDirection: "row",
  justifyContent: "space-between",
},
striverProgressContainer: {
  width: "40%",
  alignItems: "center",
},
difficultyBreakdownContainer: {
    width: "55%",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 10,
  },
  progressContainer: {
    flexDirection: "row", // Keeps label and progress bar on the same line
    alignItems: "center", // Aligns them vertically
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    width: 60, // Set a fixed width so the label aligns properly
    textAlign: "right",
    marginRight: 10, // Space between label and progress bar
  },
  progressBarWrapper: {
    flex: 1, // Makes the progress bar take the remaining space
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  customProgressBar: {
    height: "100%",
    backgroundColor: "#4BC0C0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarText: {
    color: "transparent", // Hides the text while keeping space occupied
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 5,
  },
  // Skeleton styles
  skeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  skeletonUserInfo: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  skeletonUsername: {
    height: 20,
    width: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  skeletonStreak: {
    height: 16,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skeletonStatsCard: {
    height: 80,
    flex: 0.48,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonChartContainer: {
    height: 200,
    marginTop: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  // Updated and added skeleton styles
  skeletonCardTitle: {
    height: 22,
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  skeletonStatLabel: {
    height: 16,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonStatValue: {
    height: 16,
    width: '25%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e0e0e0',
    borderWidth: 15,
    borderColor: '#f2ebfc',
    overflow: 'hidden',
  },
  skeletonPercentText: {
    height: 24,
    width: 60,
    marginTop: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  skeletonChartInner: {
    width: '100%',
    height: 160,
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    overflow: 'hidden',
  },
  skeletonProgressBar: {
    height: 10,
    backgroundColor: '#4BC0C0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  noProgressContainer: {
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f4fe',
    borderRadius: 16,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#d5bdf5',
  },
  noProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b4ad3',
    marginBottom: 10,
    textAlign: 'center',
  },
  noProgressText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  checkProfileButton: {
    backgroundColor: '#8b4ad3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  checkProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  activeTabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    marginTop: 10,
    color: "#333",
  },
  noDataChartContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4fe',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  refreshHint: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
});
export default HomeScreen;