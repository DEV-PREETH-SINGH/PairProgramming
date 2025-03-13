import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import axios from "axios";
import auth from "@react-native-firebase/auth";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { House, MessageCircle, UserRoundPen } from "lucide-react-native";
import ChatListScreen from "./ChatListScreen";
import ProfileEditScreen from "./ProfileEditScreen";
import { baseUrl } from "@env";
import { useUser } from './context/UserContext';
import UserListScreen from "./UserListScreen";

const Tab = createBottomTabNavigator();

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
      setLoadingProgress(true); // Start loading
      const response = await axios.get(`${baseUrl}/get-progress/${userId}`);
      setLeetcodeProgress(response.data);
      console.log(response.data.submissionCalendar);
      setLoadingProgress(false); // Stop loading
    } catch (error) {
      console.error("Error fetching LeetCode progress:", error);
      setLoadingProgress(false);
    }
  };

  const prepareChartData = (submissionCalendar) => {
    const labels = [];
    const data = [];

    for (const timestamp in submissionCalendar) {
      const date = new Date(Number(timestamp) * 1000); // Convert to milliseconds
      const day = date.toLocaleDateString(); // Get a readable date
      labels.push(day);
      data.push(submissionCalendar[timestamp]); // Get submission count
    }

    return { labels, data };
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        
      }}
    >
      <Tab.Screen
        name="Home"
        component={() => (
          <View style={styles.container}>
            <Text style={styles.heading}>Welcome to Code Buddy</Text>
            <Text style={styles.text}>Ready to solve problems with your coding partner?</Text>

            {/* LeetCode Progress */}
            <TouchableOpacity
              style={styles.progressContainer}
              onPress={() => navigation.navigate("DSASheetList")}
            >
              {loadingProgress ? (
                <Text style={styles.progressText}>Loading progress...</Text>
              ) : leetcodeProgress ? (
                <>
                  <Text style={styles.progressText}>
                    LeetCode Progress: {leetcodeProgress.solvedQuestions} questions solved
                  </Text>
                  <Text style={styles.progressText}>
                    {leetcodeProgress.striverDSAProgress.solvedCount} out of {leetcodeProgress.striverDSAProgress.totalCount} problems solved from Striver's DSA. Percentage: {leetcodeProgress.striverDSAProgress.progressPercentage}
                  </Text>

                  {/* Display the chart */}
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
                      width={Dimensions.get("window").width - 32} // Adjust the width
                      height={220}
                      chartConfig={{
                        backgroundColor: "#fff",
                        backgroundGradientFrom: "#fff",
                        backgroundGradientTo: "#fff",
                        decimalPlaces: 0, // No decimals
                        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: "6",
                          strokeWidth: "2",
                          stroke: "#ffa726",
                        },
                      }}
                      bezier
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.progressText}>No progress available</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  progressContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    color: "#333",
  },
  chartContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  tabBar: {
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
