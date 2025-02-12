import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


// ✅ Ensure you use the correct Web Client ID from Firebase
GoogleSignin.configure({
  webClientId: '496801671434-379kmtn7e0ubq5kti6rhmdeb9n19n2m1.apps.googleusercontent.com', // Replace with Firebase Web Client ID
  offlineAccess: false,
  forceCodeForRefreshToken: true,
  scopes: ['profile', 'email'], // Add scopes for profile and email access
});

// export const googleSignIn = async () => {
//   try {
//     console.log("Checking Google Play Services...");
//     await GoogleSignin.hasPlayServices();
//     console.log("Google Play Services available!");

//     console.log("Signing out from any existing session...");
//     await GoogleSignin.signOut();  // ✅ Ensures a fresh sign-in

//     console.log("Signing in with Google...");
//     const userInfo = await GoogleSignin.signIn();
//     const {idToken} = await GoogleSignin.signIn();
//     console.log(idToken)
//     console.log(userInfo)
//     console.log(userInfo.data.idToken)
//     if (!userInfo.data.idToken) {
//       throw new Error("Google Sign-In failed: No ID Token received");
//     }
    
//     console.log("ID Token received:", userInfo.data.idToken);

//     const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
//     console.log("Signing in with Firebase...");

//     return auth().signInWithCredential(googleCredential);
//   } catch (error) {
//     console.error('Google Sign-In Error:', error.message || error);
//     throw error;
//   }
// };



// Email Sign-Up function
export const googleSignIn = async (navigation) => {
  try {
    console.log("Checking Google Play Services...");
    await GoogleSignin.hasPlayServices();
    console.log("Google Play Services available!");

    console.log("Signing out from any existing session...");
    await GoogleSignin.signOut(); // Ensures fresh sign-in

    console.log("Signing in with Google...");
    const userInfo = await GoogleSignin.signIn();
    //const {idToken} = await GoogleSignin.signIn();
    // const { idToken } = userInfo.data.idToken;

    if (!userInfo.data.idToken) {
      throw new Error("Google Sign-In failed: No ID Token received");
    }

    console.log("ID Token received:", userInfo.data.idToken);

    const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
    console.log("Signing in with Firebase...");

    // 🔹 Sign in with Firebase and get user credentials
    const userCredential = await auth().signInWithCredential(googleCredential);
    const { isNewUser } = userCredential.additionalUserInfo; // Check if new user

    console.log("New User:", isNewUser);

    if (isNewUser) {
      // 🔹 Redirect to Profile Completion Screen
      navigation.navigate('ProfileCompletion');
      // , {
      //   email: userCredential.user.email,
      //   profilePic: userCredential.user.photoURL,
      // });
    } else {
      // 🔹 Redirect to Home Screen
      navigation.navigate('Home');
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error.message || error);
    throw error;
  }
};



export const signUp = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    console.log('User account created & signed in!', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error during sign up: ', error.message);
    throw error; // Rethrow the error to handle it in the component
  }
};

// Email Sign-In function
export const signIn = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log('User signed in!', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error during sign-in:', error.message);
    throw error;
  }
};

export default auth;
