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
  ActivityIndicator,
} from "react-native";
import { Button, theme, Icon } from "galio-framework";
import { argonTheme } from "../constants/";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { API_Url2 } from "../utils/API";

const { height, width } = Dimensions.get("screen");

const AnprFR = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const [modalVisibles, setModalVisibles] = useState(false); // State for controlling modal visibility
  const [name, setName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [selectedVisitingPlace, setSelectedVisitingPlace] = useState(
    "Select Visiting Place"
  );
  const [selectedVisitingType, setSelectedVisitingType] = useState(
    "Select Visiting Type"
  );
  const [token, setToken] = useState(null);
  const [unitList, setUnitList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();
  const [personImage, setPersonImage] = useState("");
  const [vechileImage, setVechileImage] = useState("");
  const [selectedLaneId, setSelectedLaneId] = useState(null);
  const [selectedLane, setSelectedLane] = useState("");
  const [visitorPurposes, setVisitorPurposes] = useState([]);
  const [values, setValues] = useState(null);
  const [isFocuses, setIsFocuses] = useState(false);
  const [value, setValue] = useState(null);
  const [isFocuse, setIsFocuse] = useState(false);
  const [valuess, setValuess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [laneType, setLaneType] = useState(2);
  const [isFocusess, setIsFocusess] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);
  const [deviceIp, setDeviceIp] = useState("");
  const [formData, setFormData] = useState({
    authorization_status: false,
    authorized_no: "",
    camera_id: "",
    employee_id: "",
    employee_name: "",
    face_status: false,
    image: "",
    is_mapped: false,
    license_plate_no: "",
    timestamp: "",
    fr_employee_name: "",
    fr_encoded_image: "",
  });

  const fetchTokenFromStorage = async () => {
    try {
      const token = await AsyncStorage.getItem("@tokenGaurdApp");
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

  const clearData = () => {
    setVechileImage("");
    setPersonImage("");
    setName("");
    setPhoneNo("");
    setVehicleNo("");
    setSelectedUnit("");
    setSelectedVisitingType("Select Visiting Type");
    setFormData({
      authorization_status: false,
      authorized_no: "",
      camera_id: "",
      employee_id: "",
      employee_name: "",
      face_status: false,
      image: "",
      is_mapped: false,
      license_plate_no: "",
      timestamp: "",
      fr_employee_name: "",
      fr_encoded_image: "",
    });
  };

  useEffect(() => {
    if (formData && formData.fr_employee_name) {
      setName(formData.fr_employee_name);
    }

    if (formData && formData.license_plate_no) {
      setVehicleNo(formData.license_plate_no);
    }
    console.log("hello");
  }, [formData]);

  useEffect(() => {
    if (dropdownData) {
      const filteredData = dropdownData.filter(
        (item) => item.value === selectedLaneId
      );
      if (filteredData.length > 0) {
        setLaneType(filteredData[0].type);
        setDeviceIp(filteredData[0].device_ip);
        clearData();
        setFormData({
          authorization_status: false,
          authorized_no: "",
          camera_id: "",
          employee_id: "",
          employee_name: "",
          face_status: false,
          image: "",
          is_mapped: false,
          license_plate_no: "",
          timestamp: "",
          fr_employee_name: "",
          fr_encoded_image: "",
        });
        fetchVehicleLogFromRedis();
      }
    }
  }, [selectedLaneId]);

  // const types = dropdownData.map;

  const fetchDeviceData = async () => {
    try {
      await fetchTokenFromStorage();
      if (token) {
        const response = await axios.get(API_Url2 + "/get_gaurd_master", {
          headers: {
            "x-access-token": token,
          },
        });

        const { lane_data, unit_data, visiting_purposes } = response.data;

        // Update lane data for dropdown
        const dropdownOptions = lane_data.map((lane) => ({
          label: lane.lane_name,
          value: lane.lane_id,
          type: lane.lane_type,
          device_ip: lane.device_ip,
        }));
        setDropdownData(dropdownOptions);

        // Update unit list state
        const unitListData = unit_data.map((unit) => ({
          label: unit.label,
          value: unit.value,
        }));
        setUnitList(unitListData);

        // Update visitor purposes state
        const visitorPurposesData = visiting_purposes.map((purpose) => ({
          label: purpose.label,
          value: purpose.value,
        }));
        setVisitorPurposes(visitorPurposesData);

        // if (dropdownOptions.length > 0 && !selectedLane) {
        //   setSelectedLane(dropdownOptions[0].value);
        // }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  useEffect(() => {
    setLoading(true); // Set loading state to true before making the API call

    const fetchData = async () => {
      try {
        await fetchTokenFromStorage();
        // await fetchUnitListFromApi();
        await fetchVehicleLogFromRedis();
        await fetchDeviceData();
        setLoading(false); // Update loading state to false after all API calls are completed
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response.status == 401) {
          Alert.alert("Error", "Your session expired please login again");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        } else {
          Alert.alert(
            "Error",
            "Failed to add visitor. Please try again later."
          );
        } // Update loading state to false in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  console.log("device", deviceIp);

  useEffect(() => {
    setFormData({
      authorization_status: false,
      authorized_no: "",
      camera_id: "",
      employee_id: "",
      employee_name: "",
      face_status: false,
      image: "",
      is_mapped: false,
      license_plate_no: "",
      timestamp: "",
      fr_employee_name: "",
      fr_encoded_image: "",
    });
  }, [deviceIp, token, laneType, selectedLaneId]);

  const fetchVehicleLogFromRedis = async () => {
    try {
      const response = await fetch(
        `http://192.168.20.96:10000/get_vehicle_log_from_redis`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Failed to fetch data. Status: " + response.status);
      } else {
        console.log("ok response");
      }

      // Parse the response as JSON
      const data = await response.json();
      // console.log(data.data);
      console.log(data);

      setFormData(data.data);
    } catch (error) {
      // Handle errors gracefully
      console.error("Error fetching data in redis api: ", error);
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

  useEffect(() => {
    setFormData({
      authorization_status: false,
      authorized_no: "",
      camera_id: "",
      employee_id: "",
      employee_name: "",
      face_status: false,
      image: "",
      is_mapped: false,
      license_plate_no: "",
      timestamp: "",
      fr_employee_name: "",
      fr_encoded_image: "",
    });
    fetchVehicleLogFromRedis();
  }, [deviceIp, token, laneType]);

  const route = useRoute();
  const receivedData = route.params;
  // console.log(receivedData);

  const sendNotification = async () => {
    try {
      const requestBody = {
        name: name,
        visiting_place: 1, //selectedVisitingPlace.value,
        visiting_purpose: selectedVisitingType,
      };

      const response = await fetch(`${API_Url2}/send_notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You can add additional headers here if needed
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        // console.log(responseData.message); // Output: Notification sent
      } else {
        console.error(responseData.message); // Output: Failed to send Notification
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const renderLabels = () => {
    if (values || isFocuses) {
      return (
        <Text style={[styles.label, isFocuses && { color: "blue" }]}>
          Select Lane
        </Text>
      );
    }
    return null;
  };

  useEffect(() => {
    if (receivedData) {
      if (receivedData.id === "personImage") {
        setPersonImage(receivedData.takenPicture);
      } else if (receivedData.id === "vehicleImage") {
        setVechileImage(receivedData.takenPicture);
      }
    } else {
      // If receivedData is empty, check if formData is available
      if (formData?.fr_encoded_image) {
        setPersonImage(formData.fr_encoded_image);
      } else {
        setPersonImage(""); // Set personImage to empty if formData is also not available
      }
      if (formData?.image) {
        setVechileImage(formData.image);
      } else {
        setVechileImage(""); // Set vechileImage to empty if formData is also not available
      }
    }
  }, [receivedData, formData]);

  const renderLabelType = () => {
    if (value || isFocuse) {
      return (
        <Text style={[styles.label, isFocuse && { color: "blue" }]}>
          Select Visiting Place
        </Text>
      );
    }
    return null;
  };

  const renderLabelPlace = () => {
    if (valuess || isFocusess) {
      return (
        <Text style={[styles.label, isFocusess && { color: "blue" }]}>
          Select Visiting Place
        </Text>
      );
    }
    return null;
  };

  const addVisitor = async () => {
    // Trim input values
    const trimmedName = name.trim();
    const trimmedVehicleNo = vehicleNo.trim();
    const trimmedPhoneNo = phoneNo.trim();

    if (trimmedPhoneNo.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    // Check if any of the required fields are empty or contain only spaces
    if (
      !trimmedName ||
      (!trimmedVehicleNo && laneType !== 0) ||
      !trimmedPhoneNo ||
      selectedVisitingPlace === "Select Visiting Place" ||
      selectedVisitingType === "Select Visiting Type" ||
      !selectedLaneId
    ) {
      // If any required field is empty, display an alert to the user
      Alert.alert("Please fill in all the required fields.");
      return; // Exit the function early without submitting the form
    }

    // Validate phone number to allow only numeric input
    if (!/^\d+$/.test(trimmedPhoneNo)) {
      // If phone number contains non-numeric characters, display an alert
      Alert.alert("Phone number should contain only numbers.");
      return; // Exit the function early without submitting the form
    }

    try {
      setLoading(true);
      // Proceed with form submission
      const response = await fetch(API_Url2 + "/addVisitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          vehicle_no: trimmedVehicleNo,
          phone_no: trimmedPhoneNo,
          visiting_place: selectedUnit, // Access the value property
          visiting_purpose: selectedVisitingType,
          lane_id: selectedLaneId, // Use selectedLaneId instead of laneId
          image: receivedData?.responseData,
          vehicle_image: vechileImage,
          fr_image: personImage,
        }),
      });

      // Handle response
      const data = await response.json();
      console.log("Response:", data);

      if (data.status === 0) {
        // Show an alert if status is 0
        Alert.alert("Failed to add visitor");
      } else if (data.status === 1) {
        // Reset form fields after successful submission
        navigation.goBack();
        setName("");
        setVehicleNo("");
        setPhoneNo("");
        setSelectedVisitingPlace("Select Visiting Place");
        setSelectedVisitingType("Select Visiting Type");
        setSelectedLaneId(null); // Reset selected lane ID

        // Show success alert
        Alert.alert("Visitor added successfully!");
      }

      // You can also store the response data if needed
      const visitorId = data["visitor id"];
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add visitor. Please try again later.");
      if (error.response.status == 401) {
        Alert.alert("Error", "Your session expired please login again");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        Alert.alert("Error", "Failed to add visitor. Please try again later.");
      }
    } finally {
      // Set loading state to false when API call is finished
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      await addVisitor(); // Call addVisitor function
      await sendNotification(); // Call sendNotification function
    } catch (error) {
      console.error("Error handling request:", error);
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

  const getImageSource = () => {
    if (laneType === 0) {
      return require("./person.jpg");
    } else if (laneType === 1) {
      return require("./images.jpeg");
    } else {
      return require("./person.jpg");
    }
  };

  console.log(selectedUnit);

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.containers}>
              <View>
                {renderLabels()}
                <Dropdown
                  style={[
                    styles.dropdown,
                    isFocuses && { borderColor: "blue" },
                  ]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={dropdownData} // Use the dropdownData state variable here
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocuses ? "Select Lane" : "..."}
                  searchPlaceholder="Search..."
                  value={selectedLane} // Use the selectedLane state variable here
                  onFocus={() => setIsFocuses(true)}
                  onBlur={() => setIsFocuses(false)}
                  onChange={(item) => {
                    setValues(item);
                    setSelectedLaneId(item.value); // Update selectedLane based on the selected value
                    setIsFocuses(false);
                  }}
                />
              </View>
            </View>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {/*left side*/}
              {laneType == 2 ? (
                <View
                  style={{
                    width: "84%",
                    flex: 1,
                    marginRight: 5,
                    marginLeft: 10,
                  }}
                >
                  {vechileImage ? (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                      <Image
                        style={styles.ImageStyle}
                        source={{
                          uri: `data:image/jpeg;base64,${vechileImage}`,
                        }}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                      <Image
                        source={require("./images.jpeg")}
                        style={styles.ImageStyle}
                      />
                    </TouchableOpacity>
                  )}
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
                        <Icon
                          name="close"
                          family="ionicons"
                          size={30}
                          color="white"
                        />
                      </TouchableOpacity>
                      {vechileImage ? (
                        <Image
                          style={styles.fullSizeImage}
                          source={{
                            uri: `data:image/jpeg;base64,${vechileImage}`,
                          }}
                        />
                      ) : (
                        <Image
                          source={require("./images.jpeg")}
                          style={styles.fullSizeImage}
                        />
                      )}
                    </View>
                  </Modal>

                  <TouchableOpacity style={styles.touchImageIcon}>
                    <Button
                      shadowless
                      style={styles.buttonImage}
                      color={argonTheme.COLORS.WHITE}
                      onPress={() =>
                        navigation.navigate("Camera", { id: "vehicleImage" })
                      }
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
              ) : null}
              {/* right side */}
              <View
                style={{
                  width: "84%",
                  flex: 1,
                  marginRight: 10,
                  marginLeft: 5,
                }}
              >
                {personImage ? (
                  <TouchableOpacity onPress={() => setModalVisibles(true)}>
                    <Image
                      style={styles.ImageStyle}
                      source={{
                        uri: `data:image/jpeg;base64,${
                          laneType === 0
                            ? personImage
                            : laneType === 1
                            ? vechileImage
                            : personImage
                        }`,
                      }}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setModalVisibles(true)}>
                    <Image
                      source={getImageSource()}
                      style={styles.ImageStyle}
                    />
                  </TouchableOpacity>
                )}
                <Modal
                  visible={modalVisibles}
                  transparent={true}
                  onRequestClose={() => setModalVisibles(false)}
                >
                  <View style={styles.modalContainer}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisibles(false)}
                    >
                      <Icon
                        name="close"
                        family="ionicons"
                        size={30}
                        color="white"
                      />
                    </TouchableOpacity>
                    {personImage ? (
                      <Image
                        style={styles.fullSizeImage}
                        source={{
                          uri: `data:image/jpeg;base64,${
                            laneType === 0
                              ? personImage
                              : laneType === 1
                              ? vechileImage
                              : personImage
                          }`,
                        }}
                      />
                    ) : (
                      <Image
                        source={getImageSource()}
                        style={styles.fullSizeImage}
                      />
                    )}
                  </View>
                </Modal>

                <TouchableOpacity style={styles.touchImageIcon}>
                  <Button
                    shadowless
                    style={styles.buttonImage}
                    color={argonTheme.COLORS.WHITE}
                    onPress={() =>
                      navigation.navigate("Camera", { id: "personImage" })
                    }
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
            </View>
            {/* End of modal */}
          </View>
          <View style={{ alignItems: "center" }}>
            <View style={styles.card}>
              <TextInput
                selectionColor="black"
                textColor="black"
                mode="outlined"
                label="Name"
                placeholder="Enter name"
                style={{
                  width: width - theme.SIZES.BASE * 3.4,
                  backgroundColor: "white",
                }}
                onChangeText={(text) => {
                  const alphanumericText = text.replace(/[^a-zA-Z0-9\s]/g, "");
                  setName(alphanumericText);
                }}
                value={name}
              />
              {laneType == 0 ? null : (
                <TextInput
                  selectionColor="black"
                  textColor="black"
                  mode="outlined"
                  label="Vehicle Number"
                  placeholder="Enter Vehicle Number"
                  style={{
                    width: width - theme.SIZES.BASE * 3.4,
                    backgroundColor: "white",
                  }}
                  onChangeText={(text) => setVehicleNo(text)}
                  value={vehicleNo}
                />
              )}
              <TextInput
                selectionColor="black"
                textColor="black"
                mode="outlined"
                label="Phone No."
                placeholder="Enter Phone No."
                style={{
                  width: width - theme.SIZES.BASE * 3.4,
                  backgroundColor: "white",
                }}
                onChangeText={(text) => {
                  // Remove non-numeric characters
                  const numericText = text.replace(/[^\d]/g, "");
                  // Limit to 10 digits
                  const trimmedText = numericText.substring(0, 10);
                  setPhoneNo(trimmedText);
                }}
                value={phoneNo}
                keyboardType="numeric"
              />

              <View style={styles.containers}>
                <View>
                  {renderLabelPlace()}
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocusess && { borderColor: "blue" },
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={unitList.map((unit) => ({
                      label: unit.label,
                      value: unit.value,
                    }))} // Pass unitList as data
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocusess ? "Select Visiting Place" : "..."}
                    searchPlaceholder="Search..."
                    value={selectedUnit} // Use selectedUnit instead of values
                    onFocus={() => setIsFocusess(true)}
                    onBlur={() => setIsFocusess(false)}
                    onChange={(item) => {
                      setValuess(item);
                      setSelectedUnit(item.value); // Update selectedUnit based on the selected value
                      setSelectedVisitingPlace(item.label);
                      setIsFocusess(false);
                    }}
                  />
                </View>
              </View>
              <View>
                <View>
                  {renderLabelType()}
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocuse && { borderColor: "blue" },
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={visitorPurposes.map((purpose) => ({
                      label: purpose.label,
                      value: purpose.value,
                    }))} // Use visitor purposes from state
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocuse ? "Select Visiting Type" : "..."}
                    searchPlaceholder="Search..."
                    value={selectedVisitingType} // Use selectedVisitingType from state
                    onFocus={() => setIsFocuse(true)}
                    onBlur={() => setIsFocuse(false)}
                    onChange={(item) => {
                      setValue(item);
                      setSelectedVisitingType(item.value); // Update selectedVisitingType based on the selected value
                      setIsFocuse(false);
                    }}
                  />
                </View>
              </View>
              <Button
                shadowless
                style={styles.button}
                onPress={handleSendRequest}
              >
                <Text style={styles.buttonText}>Send Request</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      )}
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
    width: "100%",
    resizeMode: "contain",
    // objectFit: "fill",
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
  containers: {
    // backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    backgroundColor: "white",
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    padding: 13,
    width: width - theme.SIZES.BASE * 3.4,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 10,
    top: -5,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default AnprFR;
