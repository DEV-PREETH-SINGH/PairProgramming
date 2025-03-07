import { PORT } from "@env";
import { baseUrl } from "@env";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import axios from "axios";
import auth from "@react-native-firebase/auth";
import UserListScreen from "./UserListScreen";
import ChatListScreen from "./ChatListScreen";
import ProfileEditScreen from "./ProfileEditScreen";
import { House, MessageCircle, UserRoundPen } from "lucide-react-native";

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const [uid, setUid] = useState("Guest");
  const [usersTodayCount, setUsersTodayCount] = useState(0); // Added state for count
  const [leetcodeProgress, setLeetcodeProgress] = useState(null); // State for LeetCode progress
  const [loadingProgress, setLoadingProgress] = useState(true); // Loading state for LeetCode progress

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUid(user.uid || "Guest");
    }

    // Fetch the number of users who started today
    fetchUsersTodayCount();

    // Fetch LeetCode progress
    if (user) {
      fetchLeetcodeProgress(user.uid);
    }
  }, []);

  const fetchUsersTodayCount = async () => {
    try {
      const response = await axios.get(`${baseUrl}/count-start-today`);
      setUsersTodayCount(response.data.count); // Update the count
      console.log(response.data.count);
    } catch (error) {
      console.error("Error fetching users today count:", error);
    }
  };

  const fetchLeetcodeProgress = async (userId) => {
    try {
      setLoadingProgress(true); // Start loading
      const response = await axios.get(`${baseUrl}/get-progress/${userId}`);
      setLeetcodeProgress(response.data); // Set the fetched progress
      setLoadingProgress(false); // Stop loading
    } catch (error) {
      console.error("Error fetching LeetCode progress:", error);
      setLoadingProgress(false); // Stop loading on error
    }
  };

  const handleStartToday = async () => {
    try {
      await axios.post(`${baseUrl}/start-today`, { uid });
      fetchUsersTodayCount(); // Refresh count after pressing the button
      navigation.navigate("UserList");
    } catch (error) {
      console.error("Error sending user data:", error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // Remove labels
      }}
    >
      <Tab.Screen
        name="Home"
        component={() => (
          <View style={styles.container}>
            <Text style={styles.heading}>Welcome to Code Buddy</Text>
            <Text style={styles.text}>Ready to solve problems with your coding partner?</Text>

            <TouchableOpacity style={styles.startTodayButton} onPress={handleStartToday}>
              <Text style={styles.startTodayText}>Start Today</Text>
            </TouchableOpacity>

            {/* Show the number of users who started today */}
            <Text style={styles.usersTodayText}>
              {usersTodayCount} user(s) have started today
            </Text>

            {/* Show LeetCode Progress */}
            <View style={styles.progressContainer}>
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
                </>
              ) : (
                <Text style={styles.progressText}>No progress available</Text>
              )}
            </View>
          </View>
        )}
        options={{
          tabBarIcon: ({ color, size }) => <House size={20} color="#000" />,
        }}
      />

      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MessageCircle size={20} color="#000" />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileEditScreen}
        options={{
          tabBarIcon: ({ color, size }) => <UserRoundPen size={20} color="#000" />,
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
  startTodayButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
  },
  startTodayText: {
    color: "#fff",
    fontSize: 18,
  },
  usersTodayText: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
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
  tabBar: {
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
