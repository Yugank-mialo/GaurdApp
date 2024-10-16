import React, { useState, useEffect } from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Add for Tab Navigation
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { Icon } from "galio-framework";
import Login from "./screens/Login";
import CameraApp from "./screens/Camera";
import AnprFR from "./screens/AnprFR";
import ArrivedScreen from "./screens/ArrivedScreen";
import Logs from "./screens/Logs";
import WaitingScreen from "./screens/WaitingScreen";
import ModalScreen from "./screens/ModalScreen";
import { PaperProvider } from "react-native-paper";
import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator(); // Tab navigator for Arrived and Waiting

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

// Custom Drawer Content
function CustomDrawerContent(props) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@ResidentApptoken");
      // await AsyncStorage.removeItem("@serverIpFRApp");
      // await AsyncStorage.removeItem("@validatorIdFRApp");
      props.navigation.navigate("Login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.logoContainer}>
        <Image source={require("./assets/gt_logo.png")} style={styles.logo} />
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

// Tab Navigator for "Arrived" and "Waiting"
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Arrived"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let familyName = "entypo";
          // let iconSize = 30;
          if (route.name === "Arrived") {
            iconName = "users";
            familyName = "entypo";
          } else if (route.name === "Pending") {
            iconName = "bell";
            familyName = "entypo";
          } else if (route.name === "Logs") {
            iconName = "filetext1";
            familyName = "AntDesign";
          }
          return (
            <Icon
              name={iconName}
              size={size}
              color={color}
              family={familyName}
            />
          );
        },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "white", // Customize the tab background color
          paddingBottom: 5, // Add padding to make it more comfortable
          height: 60, // Height of the tab bar
        },
        tabBarLabelStyle: {
          fontSize: 12, // Font size of the tab labels
          fontWeight: "700",
        },
      })}
    >
      <Tab.Screen name="Arrived" component={ArrivedScreen} />
      <Tab.Screen name="Pending" component={WaitingScreen} />
      {/* <Tab.Screen name="Logs" component={Logs} /> */}
      {/* <Tab.Screen name="Logs"  /> */}
    </Tab.Navigator>
  );
}

// Drawer Navigator
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveBackgroundColor: "red",
        drawerActiveTintColor: "white",
        drawerInactiveTintColor: "red",
        drawerItemStyle: {
          borderRadius: 15,
          marginVertical: 5,
        },
      }}
    >
      {/* Add TabNavigator to Drawer */}
      <Drawer.Screen
        name="Visitors"
        component={TabNavigator}
        options={{
          title: "Visitors", // Title for the tab (Arrived & Waiting)
        }}
      />
      <Drawer.Screen
        name="Logs"
        component={Logs}
        options={{
          title: "Logs",
        }}
      />
      <Drawer.Screen
        name="AnprFR"
        component={AnprFR}
        options={{
          title: "Add visitors details",
        }}
      />
    </Drawer.Navigator>
  );
}

// Main App Navigator
export default function App() {
  // const [fcmToken, setFcmToken] = useState();
  // const getToken = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   const fcmToken = await messaging().getToken();
  //   // console.log(token);
  //   if (fcmToken) {
  //     setFcmToken(fcmToken);
  //     await AsyncStorage.setItem("@fcm_guard_token", fcmToken);
  //     //update token in database for user_id
  //   }
  // };
  // console.log("FCM Token", fcmToken);

  // useEffect(() => {
  //   getToken();
  // }, []);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      // Request permission to send notifications
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      // Get the FCM token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("FCM Token:", token);

      // Store the token using AsyncStorage
      await AsyncStorage.setItem("@fcm_guard_token", token);
    };

    registerForPushNotifications();
  }, []);
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
            {/* <Stack.Screen name="Signup" component={SignUP} />
          <Stack.Screen
            name="ProfileManagement"
            component={ProfileManagement}
          /> */}
            <Stack.Screen name="Camera" component={CameraApp} />
            <Stack.Screen name="ModalScreen" component={ModalScreen} />
          </>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    tintColor: "red",
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 10,
    paddingLeft: 20,
    alignItems: "left",
  },
  logoutText: {
    fontSize: 16,
    color: "red",
    // fontWeight: "600",
  },
});
