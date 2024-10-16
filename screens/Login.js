import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { Block, Button, Text, theme } from "galio-framework";
import { Images, argonTheme } from "../constants/";
import { HeaderHeight } from "../constants/utils";
import { TextInput } from "react-native-gesture-handler";
import { Icon } from "galio-framework";
import axios from "axios";
import { API_Url } from "../utils/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get("screen");

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("user4");
  const [password, setPassword] = useState("admin@123");
  const [serverId, setServerId] = useState("http://106.51.37.159:9998");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(null);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("@fcm_guard_token");
        if (token !== null) {
          // console.log("Token retrieved successfully:", token);
          setToken(token); // Set the token in state
        } else {
          console.log("Token not found in local storage.");
        }
      } catch (error) {
        console.error("Error retrieving token from local storage:", error);
      }
    };

    fetchToken();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${serverId}/loginCheck`,
        {
          username: username,
          password: password,
          fcm_token: token,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("fcm token ", response);

      const result = response.data;

      if (result.type === 1) {
        // Successful login
        const token = result.token;
        await AsyncStorage.setItem("@tokenGaurdApp", token); // Store the token in AsyncStorage
        navigation.navigate("DrawerNavigator"); // Navigate to the next screen
      } else {
        // Failed login
        Alert.alert("Login Failed", "Invalid username or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Login Failed", "Unable to login. Please try again later.");
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: "100%" }}
        alwaysBounceVertical={false}
      >
        <View style={{ flexGrow: 1 }}>
          <Block flex style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Block>
              <Block space="between" style={styles.padded}>
                <Image source={Images.ArgonLogo} style={styles.logo} />
              </Block>
              <Block style={styles.padded}>
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Sever IP"
                    onChangeText={setServerId}
                    value={serverId}
                  />
                  <Icon
                    family="ArgonExtra"
                    size={20}
                    name="wifi"
                    style={styles.icon}
                  />
                </View>
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Your ID"
                    onChangeText={setUsername}
                    value={username}
                  />
                  <Icon
                    family="ArgonExtra"
                    size={20}
                    name="badge"
                    style={styles.icon}
                  />
                </View>
                <View>
                  <TextInput
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    placeholder="Password"
                  />
                  <Icon
                    family="ArgonExtra"
                    size={20}
                    name={showPassword ? "lock-open" : "lock"}
                    style={styles.icon}
                    onPress={toggleShowPassword}
                  />
                </View>
                <Button
                  shadowless
                  style={styles.button}
                  color={argonTheme.COLORS.WHITE}
                  onPress={handleLogin} // Call handleLogin function on button press
                >
                  <Text style={styles.buttonText}>LOGIN</Text>
                </Button>
              </Block>
            </Block>
          </Block>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    justifyContent: "center",
    alignItems: "center",
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    alignItems: "center",
    zIndex: 3,
    bottom:
      Platform.OS === "android" ? theme.SIZES.BASE * 2 : theme.SIZES.BASE * 3,
  },
  logo: {
    marginBottom: theme.SIZES.BASE * 1.5,
    width: width - 62,
    height: undefined,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  input: {
    height: 60,
    width: width - 32,
    borderColor: "white",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  icon: {
    position: "absolute",
    top: 20,
    left: 10,
  },
  button: {
    width: width - theme.SIZES.BASE * 1.7,
    height: theme.SIZES.BASE * 3,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 15,
  },
  buttonText: {
    fontFamily: "open-sans-bold",
    fontSize: 14,
    color: "red",
    fontWeight: 900,
  },
});

export default Login;
