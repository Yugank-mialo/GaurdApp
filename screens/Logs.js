import {
  View,
  Text,
  FlatList,
  Dimensions,
  Image,
  Alert,
  Pressable,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
const { width } = Dimensions.get("screen");
import ModalDropdown from "react-native-modal-dropdown";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { API_Url, API_Url1, API_Url2 } from "../utils/API";

const Logs = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef();
  const [oldData, setOldData] = useState([]);
  const [selectedLane, setSelectedLane] = useState("");
  const navigation = useNavigation();
  const [token, setToken] = useState(null);
  const [values, setValues] = useState(null);
  const [isFocuses, setIsFocuses] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
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

    fetchToken();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setData([]);
    setSearch("");
    setOldData([]);
    setSelectedLane("");
    setValues(null);
    setIsFocuses(false);
    setDropdownData([]);
    await fetchData();
    setRefreshing(false);
  };

  const fetchData = async () => {
    try {
      if (token) {
        const response = await axios.get(API_Url + "/get_gaurd_master", {
          headers: {
            "x-access-token": token,
          },
        });
        const laneData = response.data.lane_data; // Extract lane_data from the response
        // Map the laneData to the format needed for dropdown options
        const dropdownOptions = laneData.map((lane) => ({
          label: lane.lane_name,
          value: lane.lane_id,
        }));
        setDropdownData(dropdownOptions);

        // Set the first lane as the default selected lane
        if (dropdownOptions.length > 0 && !selectedLane) {
          setSelectedLane(dropdownOptions[0].value);
        }
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
    fetchData();
  }, [token, selectedLane, refreshing]);

  const renderLabels = () => {
    if (selectedLane || isFocuses) {
      return (
        <Text style={[styles.label, isFocuses && { color: "blue" }]}>
          Select Lane
        </Text>
      );
    }
    return null;
  };

  console.log("profile Token log:", token);
  useEffect(() => {
    fetch(
      `${API_Url2}/getVehicleList?page_no=1&page_limit=10&society_id=1&lane_id=${selectedLane}&unclear_plates=true&no_plates=true`,
      // fetch(
      //   `${API_Url2}/getVehicleList?page_no=1&page_limit=100&society_id=1&lane_id=9&unclear_plates=true&no_plates=true`,
      {
        headers: {
          "x-access-token": token, // Include the token in the header
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        const extractedData =
          json.data?.length > 0 &&
          json.data?.map((item) => ({
            name: item.employee_name,
            image: item.img_path[0],
            vehicle_log_id: item.vehicle_log_id,
            entry_time: item.vehicle_event_logs.entry_time,
            exit_time: item.vehicle_event_logs.exit_time,
            vehicle_number: item.vehicleNo,
            visiting_place: item.unit_name,
            lane_type: item.lane_type,
          }));
        setData(extractedData);
        setOldData(extractedData);
      })
      .catch((error) => {
        console.error("Error fetching data bla: ", error);
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
        }
      });
  }, [selectedLane, token, refreshing]);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          height: 70,
          marginTop: 20,

          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: "91%",
            height: 50,
            borderRadius: 10,
            borderWidth: 0.2,

            flexDirection: "row",
            alignItems: "center",
            marginLeft: 15,
          }}
        >
          <Image
            source={require("./search.png")}
            style={{ width: 24, height: 24, marginLeft: 15, opacity: 0.5 }}
          />
          <TextInput
            ref={searchRef}
            placeholder="search Logs here..."
            style={{ width: "76%", height: 50 }}
            value={search}
            onChangeText={(txt) => {
              setSearch(txt);
            }}
          />
          {search == "" ? null : (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => {
                searchRef.current.clear();
                setSearch("");
              }}
            >
              <Image
                source={require("./close.png")}
                style={{ width: 16, height: 16, opacity: 0.5 }}
              />
            </TouchableOpacity>
          )}
        </View>
        {/* <TouchableOpacity
            style={{
              marginRight: 15,
            }}
            onPress={() => {
              setVisible(true);
            }}>
            <Image
              source={require('./filter.png')}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity> */}
        <View style={{ backgroundColor: "dodgerblue" }}></View>
      </View>
      <View style={styles.containers}>
        <View>
          {renderLabels()}
          <Dropdown
            style={[styles.dropdown, isFocuses && { borderColor: "blue" }]}
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
              setValues(item.value);
              setSelectedLane(item.value); // Update selectedLane based on the selected value
              setIsFocuses(false);
            }}
          />
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.vehicle_log_id.toString()}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                navigation.navigate("ModalScreen", { personData: item })
              }
              style={{
                width: "90%",
                borderRadius: 10,
                borderWidth: 0.5,
                alignSelf: "center",
                marginTop: 10,
                marginBottom: index == data?.length - 1 ? 20 : 0,
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{
                  width: 60,
                  height: "90%",
                  marginLeft: 10,
                  borderRadius: 10,
                }}
              />
              <View style={{ width: "80%" }}>
                {item.lane_type == 0 ? null : (
                  <Text style={{ marginLeft: 10, marginTop: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Vechile Number:</Text>
                    <Text>
                      {" "}
                      {item.vehicle_number} {console.log(item.lane_type)}
                    </Text>
                  </Text>
                )}
                {item.lane_type == 1 ? null : (
                  <Text style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Name:</Text>
                    <Text> {item.name}</Text>
                  </Text>
                )}
                {/* <Text style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Visiting Type:</Text>
                    <Text> {item.visitor_type}</Text>
                  </Text> */}
                <Text style={{ marginLeft: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Entry Time:</Text>
                  <Text style={{ color: "green" }}> {item.entry_time}</Text>
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Logs;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    display: "flex",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#ff0000",
    borderRadius: 50,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 40,
    color: "white",
    paddingBottom: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  containers: {
    // backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    paddingHorizontal: 8,
    width: width - 40,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "#FFF",
    left: 10,
    top: -8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
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
