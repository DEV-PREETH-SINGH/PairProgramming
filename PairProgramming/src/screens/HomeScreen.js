import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
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
          stroke="#E6E6E6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
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

    // Get the last 7 entries for weekly progress
    const entries = Object.entries(submissionCalendar)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .slice(-7);

    for (const [timestamp, count] of entries) {
      const date = new Date(Number(timestamp) * 1000);
      const day = date.toLocaleDateString(undefined, { weekday: 'short' });
      labels.push(day);
      data.push(count);
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

  const HomeContent = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        
        {loadingProgress ? (
          <Text style={styles.loadingText}>Loading progress...</Text>
        ) : leetcodeProgress ? (
          <>
            {/* First Section: Stats Card and Overall Progress */}
            <View style={styles.topRowContainer}>
              {/* LeetCode Stats Card */}
              <View style={styles.leftColumn}>
                <View style={styles.statsCard}>
                  <Text style={styles.cardTitle}>Leetcode</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Submissions:</Text>
                    <Text style={styles.statValue}>{leetcodeProgress.totalSubmissions?.length || 0}</Text>
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
                </View>
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
            
              {leetcodeProgress.submissionCalendar && Object.keys(leetcodeProgress.submissionCalendar).length > 0 ? (
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
                    width={windowWidth - 40}
                    height={160}
                    chartConfig={{
                      backgroundColor: "transparent",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 204, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: "3",
                        strokeWidth: "1",
                        stroke: "#ffa726",
                      },
                      fillShadowGradient: "rgba(255, 204, 0, 1)",
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
                <Text style={styles.noDataText}>No submission data available</Text>
              )}
            </View>
            
            {/* Bottom Section - Striver DSA Progress and Difficulty Breakdown */}
            <View style={styles.bottomSection}>
              <View style={styles.bottomRow}>
                {/* Striver DSA Progress */}
                <View style={styles.striverProgressContainer}>
                  <CircularProgress
                    percentage={parseFloat(leetcodeProgress.striverDSAProgress?.progressPercentage || 0)}
                    size={140}
                    strokeWidth={15}
                    text={`${leetcodeProgress.striverDSAProgress?.solvedCount || 0}/${leetcodeProgress.striverDSAProgress?.totalCount || 0}`}
                    color="#4BC0C0"
                  />
                </View>
                
                {/* Difficulty Breakdown */}
                              {/* Difficulty Breakdown */}
                              <View style={styles.difficultyBreakdownContainer}>
  <View style={{ paddingLeft: 10, paddingTop: 20 }}>
    {/* Easy Progress */}
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>Easy:</Text>
      <View style={styles.progressBarWrapper}>
        <View style={[styles.customProgressBar, { width: `${calculatePercentage(leetcodeProgress.easySolved, leetcodeProgress.totalEasy)}%` }]}>
          <Text style={styles.progressBarText}>
            {leetcodeProgress.easySolved || 0}/{leetcodeProgress.totalEasy || 0} ({calculatePercentage(leetcodeProgress.easySolved, leetcodeProgress.totalEasy).toFixed(0)}%)
          </Text>
        </View>
      </View>
    </View>

    {/* Medium Progress */}
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>Medium:</Text>
      <View style={styles.progressBarWrapper}>
        <View style={[styles.customProgressBar, { width: `${calculatePercentage(leetcodeProgress.mediumSolved, leetcodeProgress.totalMedium)}%` }]}>
          <Text style={styles.progressBarText}>
            {leetcodeProgress.mediumSolved || 0}/{leetcodeProgress.totalMedium || 0} ({calculatePercentage(leetcodeProgress.mediumSolved, leetcodeProgress.totalMedium).toFixed(0)}%)
          </Text>
        </View>
      </View>
    </View>

    {/* Hard Progress */}
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>Hard:</Text>
      <View style={styles.progressBarWrapper}>
        <View style={[styles.customProgressBar, { width: `${calculatePercentage(leetcodeProgress.hardSolved, leetcodeProgress.totalHard)}%` }]}>
          <Text style={styles.progressBarText}>
            {leetcodeProgress.hardSolved || 0}/{leetcodeProgress.totalHard || 0} ({calculatePercentage(leetcodeProgress.hardSolved, leetcodeProgress.totalHard).toFixed(0)}%)
          </Text>
        </View>
      </View>
    </View>
  </View>
</View>

              </View>
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>No progress available</Text>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        // borderTopWidth: 0, // Removes the top line
        // elevation: 0, // Removes shadow on Android
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeContent}
        options={{
          tabBarIcon: ({ color, size }) => <House size={20} color="#000" />,
          headerShown: false,
        }}
      />

      {/* Other Tab Screens */}
      <Tab.Screen
        name="UserList"
        component={UserListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <UserRoundPen size={20} color="#000" />,
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MessageCircle size={20} color="#000" />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f0f7ff",
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
    backgroundColor: "#989AAD",
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 0,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 4,
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
    backgroundColor: "#f0f7ff",
     borderTopWidth: 0,
     elevation: 0,
     borderTopColor: "#e0e0e0",
    height: 60,
    paddingBottom: 5,
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
});
export default HomeScreen;