import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Dimensions, Linking, SafeAreaView, StatusBar } from "react-native";
import axios from "axios";
import { CheckCircle, Circle, ArrowLeft } from "lucide-react-native";
import auth from '@react-native-firebase/auth';
import { baseUrl } from "@env";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get('window');

// Skeleton component for DSA problem item
const SkeletonProblemItem = ({ shimmerAnim }) => {
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.card}>
      <View style={styles.skeletonTitle}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </View>
      <View style={styles.skeletonDifficulty}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </View>
      <View style={styles.skeletonCircle}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </View>
    </View>
  );
};

// Skeleton loading component for DSA sheet list
const SkeletonDSAList = () => {
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

  return (
    <View style={styles.listContainer}>
      {[...Array(8)].map((_, index) => (
        <SkeletonProblemItem key={`skeleton-${index}`} shimmerAnim={shimmerAnim} />
      ))}
    </View>
  );
};

const DSASheetListScreen = ({ navigation }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const currentUserUID = auth().currentUser?.uid;
    if (!currentUserUID) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/api/dsa-problems`, {
        params: { uid: currentUserUID }
      });
      setProblems(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching problems:", error);
      setLoading(false);
    }
  };

  const toggleSolvedStatus = async (title, solved) => {
    try {
      const currentUserUID = auth().currentUser?.uid;
      const response = await axios.patch(`${baseUrl}/api/dsa-problems/${title}`, {
        solved: !solved,
        uid: currentUserUID,
      });
  
      if (response.status === 200) {
        setProblems(problems.map((problem) =>
          problem.title === title ? { ...problem, solved: !solved } : problem
        ));
      }
    } catch (error) {
      console.error("Error updating solved status:", error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#4BC0C0';
      case 'medium':
        return '#FF9F40';
      case 'hard':
        return '#FF6384';
      default:
        return '#8b4ad3';
    }
  };
  
  const renderItem = ({ item }) => (
    <LinearGradient
      colors={['#ffffff', '#f8f4fe']}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={[styles.difficulty, { color: getDifficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.solvedButton}
            onPress={() => toggleSolvedStatus(item.title, item.solved)}
          >
            {item.solved ? 
              <CheckCircle color="#4BC0C0" size={24} /> : 
              <Circle color="#8b4ad3" size={24} />
            }
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.practiceButton}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text style={styles.practiceButtonText}>Practice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8b4ad3" barStyle="light-content" />
      <LinearGradient
        colors={['#8b4ad3', '#bc93ed']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.heading}>Striver's DSA Sheet</Text>
      </LinearGradient>
      <View style={styles.listContainer}>
        {loading ? <SkeletonDSAList /> : (
          <FlatList 
            data={problems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    //elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  difficulty: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  solvedButton: {
    padding: 4,
  },
  practiceButton: {
    backgroundColor: '#8b4ad3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  practiceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Skeleton styles
  skeletonTitle: {
    height: 16,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDifficulty: {
    height: 14,
    width: '30%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonCircle: {
    height: 24,
    width: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
  shimmerOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default DSASheetListScreen;
