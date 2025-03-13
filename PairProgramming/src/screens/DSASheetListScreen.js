import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from "react-native";
import axios from "axios";
import { CheckCircle, Circle } from "lucide-react-native"; // Icons for solved status
import auth from '@react-native-firebase/auth'; // For getting the current user UID
import { baseUrl } from "@env";

const DSASheetListScreen = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const currentUserUID = auth().currentUser?.uid; // Get current user UID
    if (!currentUserUID) {
      console.error("User not authenticated");
      return;
    }

    try {
      // Pass the user UID in the API call to fetch problems with solved status
      const response = await axios.get(`${baseUrl}/api/dsa-problems`, {
        params: { uid: currentUserUID }
      });
      console.log(response.data)
      setProblems(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching problems:", error);
      setLoading(false);
    }
  };
  const toggleSolvedStatus = async (title, solved) => {
    try {
      const currentUserUID = auth().currentUser?.uid; // Get current user UID
      const response = await axios.patch(`${baseUrl}/api/dsa-problems/${title}`, {  // Use title in the URL as it should be the identifier
        solved: !solved,  // Toggle solved status
        uid: currentUserUID,  // Pass the user ID to the backend
      });
  
      if (response.status === 200) {
        // Update the UI state for the problem
        setProblems(problems.map((problem) =>
          problem.title === title ? { ...problem, solved: !solved } : problem
        ));
      }
    } catch (error) {
      console.error("Error updating solved status:", error);
    }
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.difficulty}>{item.difficulty}</Text>
      <TouchableOpacity onPress={() => toggleSolvedStatus(item.title, item.solved)}>
        {item.solved ? <CheckCircle color="green" size={24} /> : <Circle color="gray" size={24} />}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
        <Text style={styles.practiceButton}>Practice</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>DSA Sheet List</Text>
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
        <FlatList data={problems} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 16,
    flex: 2,
  },
  difficulty: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    flex: 1,
  },
  practiceButton: {
    color: "#007bff",
    fontSize: 16,
  },
});

export default DSASheetListScreen;
