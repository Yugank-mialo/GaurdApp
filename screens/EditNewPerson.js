import React, { useState, useRef, useEffect } from "react";
import { TextInput } from "react-native-paper";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Camera } from "expo-camera";

import { Icon } from "../components";

import { Block, Button, theme } from "galio-framework";
import { Images, argonTheme } from "../constants/";
import ModalDropdown from "react-native-modal-dropdown";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_Url, API_Url1, API_Url2 } from "../utils/API";

const { height, width } = Dimensions.get("screen");

const EditNewPerson = ({ navigation }) => {
  const route = useRoute();
  const editPerson = route.params?.editData || { item: {} };

  const [modalVisible, setModalVisible] = useState(false);
  const [visitorType, setVisitorType] = useState("");
  const [name, setName] = useState(editPerson.item.name);
  const [vehicleNo, setVehicleNo] = useState(editPerson.item.vehicle_number);
  const [phoneNo, setPhoneNo] = useState(editPerson.item.phone_number);
  const [selectedVisitingPlace, setSelectedVisitingPlace] = useState(
    "Select Visiting Place"
  );
  const [selectedVisitingType, setSelectedVisitingType] = useState(
    "Select Visiting Type"
  );
  const [laneId, setLaneId] = useState();
  const [token, setToken] = useState(null);
  const [unitList, setUnitList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [laneList, setLaneList] = useState([]);
  const [selectedLaneId, setSelectedLaneId] = useState(null);
  const [visitorPurposes, setVisitorPurposes] = useState([]);

  useEffect(() => {
    // Fetch unit list data from the API
    const fetchUnitList = async () => {
      try {
        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem("@tokenGaurdApp");

        // Make the API request with the token in the header
        const response = await fetch(API_Url2 + "/getUnitList?society_id=1", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        });

        const data = await response.json();
        if (data.status === 1) {
          setUnitList(data.data);
        } else {
          console.error("Error fetching unit list");
        }
      } catch (error) {
        console.error("Error fetching unit list:", error);
        if (error.response.status == 401) {
          Alert.alert("Error", "Your session expired please login again");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        } else {
          Alert.alert("Error", "Failed to add visitor. Please try again later.");
        }
      }
    };

    fetchUnitList();
  }, []);

  const handleUnitSelect = (index, value) => {
    setSelectedVisitingPlace(unitList[index]);
  };

  useEffect(() => {
    const fetchLaneList = async () => {
      try {
        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem("@tokenGaurdApp");

        const response = await fetch(API_Url2 + "/getDevices", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        });

        const data = await response.json();
        if (data.entry_devices && data.entry_devices?.length > 0) {
          setLaneList(data.entry_devices);
        } else {
          console.error("No lane data available");
        }
      } catch (error) {
        console.error("Error fetching lane list:", error);
        if (error.response.status == 401) {
          Alert.alert("Error", "Your session expired please login again");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        } else {
          Alert.alert("Error", "Failed to add visitor. Please try again later.");
        }
      }
    };

    fetchLaneList();
  }, []);

  const handleLandSelect = (index) => {
    const selectedLane = laneList[index];
    setSelectedLaneId(selectedLane.lane_id);
  };

  console.log(editPerson);

  const sendNotification = async () => {
    const url = "https://fcm.googleapis.com/fcm/send";
    const apiKey =
      "AAAA4gFXEP8:APA91bFFDyUg_OP2A-g512Fg9sICU6lZ6t5ENEysC7ZVrDxzsoCrOSwNbxXzPK9BqpAnHGohYDnMfOQsfgn8Wdq9GbPw_zUQJ4vfw4CoaHMHgO8ZXy5bEp3EYDoOsuln4Tn3Ytviqkwe";

    const requestBody = {
      to: "ewPvE2ckTYekLPwSExRD-Q:APA91bEQq1PZHosz9SMd8kTu4AUpMskOEaSZ-ds7kQklJBwCMLl3LASKkNQFTWYRjYpAIQCgOs5_IrYn67poc2ftjOw_007GRZ8INWgfMJhmbtkrBuUqgPMYSjpHy6Wx3WLt1Dn7PvMB",
      data: {
        data_new: "Test Data",
      },
      notification: {
        body: "This is an FCM notification message!",
        title: "FCM Message",
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log("FCM Response:", responseData);
    } catch (error) {
      console.error("Error sending FCM notification:", error);
    }
  };

  const handlePlaceSelect = (index, value) => {
    setSelectedVisitingPlace(value);
  };

  useEffect(() => {
    const fetchVisitorPurposes = async () => {
      try {
        const response = await fetch(API_Url2 + "/getVisitorpurpose");
        const data = await response.json();
        if (data.status === 1) {
          setVisitorPurposes(data.data);
        } else {
          console.error("Failed to fetch visitor purposes");
        }
      } catch (error) {
        console.error("Error fetching visitor purposes:", error);
        if (error.response.status == 401) {
          Alert.alert("Error", "Your session expired please login again");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        } else {
          Alert.alert("Error", "Failed to add visitor. Please try again later.");
        }
      }
    };

    fetchVisitorPurposes();
  }, []);

  const handleVisitingTypeSelect = (index, value) => {
    setSelectedVisitingType(value);
  };

  console.log(editPerson.item.image);

  const updateVisitor = async () => {
    try {
      // Construct the request body
      const requestBody = {
        id: editPerson.item.id,
        name: name,
        vehicle_no: vehicleNo,
        phone_no: phoneNo,
        visiting_place:
          selectedVisitingPlace.value || editPerson.item.visiting_place_id,
        visiting_purpose: selectedVisitingType,
        lane_id: selectedLaneId || editPerson.item.lane_id,
        image: editPerson.item.image,
      };

      console.log(requestBody);

      // Make the API request
      const response = await fetch(API_Url2 + "/updateVisitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // Check if the update was successful
      if (data.status === 1) {
        Alert.alert("Visitor data updated successfully");
        navigation.goBack();
        console.log("Visitor data updated successfully");
      } else {
        Alert.alert("Failed to update visitor data");
        console.error("Failed to update visitor data");
      }
    } catch (error) {
      console.error("Error updating visitor data:", error);
      if (error.response.status == 401) {
        Alert.alert("Error", "Your session expired please login again");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        Alert.alert("Error", "Failed to add visitor. Please try again later.");
      }
    }
  };

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <View
            style={{
              padding: 10,
              alignItems: "center",
            }}
          >
            <ModalDropdown
              style={{
                borderWidth: 1,
                borderColor: "black",
                backgroundColor: "#fff",
                padding: 10,
                width: width - 32,
                marginBottom: -15,
              }}
              options={laneList.map((lane) => lane.lane_name)}
              defaultValue={editPerson.item.lane_name}
              textStyle={{ fontSize: 16, color: "black", textAlign: "center" }}
              dropdownStyle={{
                width: width - 92,
                borderWidth: 1,
                borderColor: "black",
              }}
              onSelect={handleLandSelect}
            />
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            {/* Wrap the image in TouchableOpacity and set onPress to setModalVisible(true) */}
            <Image
              style={styles.ImageStyle}
              source={{
                uri: API_Url2 + "/img/" + editPerson.item.image,
              }}
            />
          </TouchableOpacity>
          {/* Modal for displaying the image in full size */}
          <Modal
            visible={modalVisible}
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" family="ionicons" size={30} color="white" />
              </TouchableOpacity>
              <Image
                style={styles.fullSizeImage}
                source={{
                  uri: API_Url2 + "/img/" + editPerson.item.image,
                }}
              />
            </View>
          </Modal>
          {/* End of modal */}
          <TouchableOpacity style={styles.touchImageIcon}>
            <Button
              shadowless
              style={styles.buttonImage}
              color={argonTheme.COLORS.WHITE}
              onPress={() => navigation.navigate("Camera1")}
            >
              <Icon
                name="camera"
                family="entypo"
                size={22}
                style={styles.buttonTextImage}
              />
            </Button>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center" }}>
          <View style={styles.card}>
            <TextInput
              mode="outlined"
              label="Name"
              placeholder="Enter name"
              style={{ width: width - theme.SIZES.BASE * 3.4 }}
              onChangeText={(text) => setName(text)}
              value={name}
            />
            <TextInput
              mode="outlined"
              label="Vehicle Number"
              placeholder="Enter Vehicle Number"
              style={{ width: width - theme.SIZES.BASE * 3.4 }}
              onChangeText={(text) => setVehicleNo(text)}
              value={vehicleNo}
            />
            <TextInput
              mode="outlined"
              label="Phone No."
              placeholder="Enter Phone No."
              style={{ width: width - theme.SIZES.BASE * 3.4 }}
              onChangeText={(text) => setPhoneNo(text)}
              value={phoneNo}
            />
            <ModalDropdown
              style={{
                borderWidth: 1,
                borderColor: "black",
                padding: 13,
                width: width - theme.SIZES.BASE * 3.4,
                marginTop: 8,
              }}
              options={unitList.map((unit) => unit.label)}
              defaultValue={editPerson.item.visiting_place}
              textStyle={{ fontSize: 16, color: "black", textAlign: "center" }}
              dropdownStyle={{
                width: width - 92,
                borderWidth: 1,
                borderColor: "black",
              }}
              onSelect={handleUnitSelect}
            />
            <ModalDropdown
              style={{
                borderWidth: 1,
                borderColor: "black",
                padding: 13,
                width: width - theme.SIZES.BASE * 3.4,
                margin: 8,
              }}
              options={visitorPurposes} // Use visitor purposes from state
              defaultValue={editPerson.item.visitor_type}
              textStyle={{ fontSize: 16, color: "black", textAlign: "center" }}
              dropdownStyle={{
                width: width - 92,
                borderWidth: 1,
                borderColor: "black",
              }}
              onSelect={handleVisitingTypeSelect}
            />
            <Button shadowless style={styles.button} onPress={updateVisitor}>
              <Text style={styles.buttonText}>Save</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    height: "50%",
    alignItems: "center",
    top: 1,
  },
  card: {
    backgroundColor: "white",
    marginVertical: theme.SIZES.BASE,
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
    alignItems: "center",
    width: width - theme.SIZES.BASE * 1.7,
    position: "relative",
    top: -70,
    zIndex: 1,
    marginBottom: 50,
  },
  button: {
    width: width - theme.SIZES.BASE * 3.4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 15,
    backgroundColor: "red",
  },
  buttonText: {
    fontFamily: "open-sans-bold",
    fontSize: 14,
    color: "white",
  },
  buttonImage: {
    width: 50,
    height: 50,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 25,
    textAlign: "right",
  },
  touchImageIcon: {
    marginStart: "auto",
  },
  buttonTextImage: {
    fontFamily: "open-sans-bold",
    color: "red",
    fontWeight: "800",
  },
  ImageStyle: {
    top: 25,
    height: 200,
    width: width - 32,
    resizeMode: "cover",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullSizeImage: {
    width: width - 40,
    height: height - 40,
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
});

export default EditNewPerson;
