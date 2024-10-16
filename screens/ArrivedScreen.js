import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ModalDropdown from "react-native-modal-dropdown";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { API_Url } from "../utils/API";

const { width } = Dimensions.get("screen");

const ArrivedScreen = () => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef();
  const [selectedLane, setSelectedLane] = useState(""); // Set default value to 0
  const [token, setToken] = useState(null);
  const [visitorData, setVisitorData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [values, setValues] = useState(null);
  const [isFocuses, setIsFocuses] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);

  const fetchToken = async () => {
    try {
      const token = await AsyncStorage.getItem("@tokenGaurdApp");
      if (token !== null) {
        setToken(token);
      } else {
        console.log("Token not found in local storage.");
      }
    } catch (error) {
      console.error("Error retrieving token from local storage:", error);
    }
  };

  const fetchLaneData = async () => {
    try {
      await fetchToken();
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
      console.error("Error fetching data lane data:", error);
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

  const searchFilterFunction = (text) => {
    setSearch(text);
    const filteredData = visitorData.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.vehicle_number.toLowerCase().includes(text.toLowerCase())
    );
    setData(filteredData);
  };

  const fetchData = async () => {
    try {
      if (token) {
        const response = await axios.get(
          `${API_Url}/getVisitorbylane?lane_id=${selectedLane}&request_status=1`,
          {
            headers: {
              "x-access-token": token,
            },
          }
        );
        const formattedData = response.data.data.map((item) => ({
          name: item.name,
          id: item.id,
          visitor_type: item.purpose,
          visiting_place: item.visiting_place,
          image: item.image,
          vehicle_number: item.vehicle_no,
          phone_number: item.contact_no,
          entry_time: item.timestamp,
          lane_type: item.lane_type,
        }));
        setVisitorData(formattedData);
        setData(formattedData); // Initialize data with visitorData
      }
    } catch (error) {
      console.error("Error fetching data of visitor data: ", error);
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

  console.log(`/getVisitorbylane?lane_id=${selectedLane}&request_status=1`);

  const formatDateTime = (isoTime) => {
    const date = new Date(isoTime);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format

    return `${day}/${month}/${year} ${formattedHours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${period}`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSelectedLane("");
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    fetchLaneData();
    fetchToken();
  }, [token, selectedLane, refreshing]);

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar */}
      <View style={{ flexDirection: "row", alignItems: "center", height: 70 }}>
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
            placeholder="Search Visitors here..."
            style={{ width: "76%", height: 50 }}
            value={search}
            onChangeText={(txt) => {
              searchFilterFunction(txt);
              setSearch(txt);
            }}
          />
          {search === "" ? null : (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => {
                searchRef.current.clear();
                searchFilterFunction("");
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
      </View>
      {/* Lane selection dropdown */}
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
              setValues(item);
              setSelectedLane(item.value); // Update selectedLane based on the selected value
              setIsFocuses(false);
            }}
          />
        </View>
      </View>
      {/* FlatList */}
      <FlatList
        data={data}
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
                marginBottom: index == data.length - 1 ? 20 : 0,
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {/* Image */}
              <Image
                source={{ uri: `${API_Url}/img/${item.image}` }}
                style={{
                  width: 60,
                  height: "90%",
                  marginLeft: 10,
                  borderRadius: 10,
                }}
              />
              {/* Details */}
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ width: "80%", flex: 2 }}>
                  {item.lane_type == 0 ? null : (
                    <Text style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        Vehicle Number:
                      </Text>
                      <Text> {item.vehicle_number}</Text>
                    </Text>
                  )}
                  {item.lane_type == 1 ? null : (
                    <Text style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>Name:</Text>
                      <Text> {item.name}</Text>
                    </Text>
                  )}
                  <Text style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Visiting Place:</Text>
                    <Text> {item.visiting_place}</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Text style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>Entry Time:</Text>
                      <Text style={{ color: "green" }}>
                        {" "}
                        {formatDateTime(item.entry_time)}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      {/* Add new person button */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AnprFR")}
      >
        <Icon
          family="entypo"
          size={35}
          name="plus"
          style={{ color: "white" }}
        />
      </TouchableOpacity> */}
    </View>
  );
};

export default ArrivedScreen;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
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
    backgroundColor: "red",
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
    backgroundColor: "#F2F2F2",
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
