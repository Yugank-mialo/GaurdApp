import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuWrapper from "./MenuWrapper";
import { API_Url } from "../utils/API";
import { Dropdown } from "react-native-element-dropdown";

// const data_drop = [
//   { label: "Waiting", value: 2 },
//   { label: "Rejected", value: 0 },
// ];

const WaitingScreen = () => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("screen");
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef();
  const [visitorData, setVisitorData] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedLane, setSelectedLane] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // Default status is waiting
  const [refreshing, setRefreshing] = useState(false);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
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

  // useEffect(() => {
  //   if (dropdownData) {
  //     const filteredData = dropdownData.filter(
  //       (item) => item.value === selectedLaneId
  //     );
  //     if (filteredData.length > 0) {
  //       setLaneType(filteredData[0].type);
  //       clearData();
  //     }
  //   }
  // }, [selectedLaneId]);

  const fetchData = async () => {
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

  const fetchVisitorData = async () => {
    try {
      let apiUrl = API_Url + "/getWaitingVisitor";

      // Construct the query parameters based on selectedLane and selectedStatus
      const queryParams = [];
      if (selectedLane !== "") {
        queryParams.push(`lane_id=${selectedLane}`);
      }
      if (selectedStatus !== "") {
        queryParams.push(`status=${selectedStatus}`);
      }

      // Append query parameters to the API URL if any
      if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join("&")}`;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          "x-access-token": token,
        },
      });

      // console.log(
      //   `/getWaitingVisitor?lane_id=${selectedLane}&status=${selectedStatus}`
      // );

      const filteredData = response.data.data.map((item) => ({
        name: item.name,
        id: item.id,
        visitor_type: item.purpose,
        visiting_place: item.visiting_place,
        vehicle_image: item.vehicle_image,
        vehicle_number: item.vehicle_no,
        phone_number: item.contact_no,
        lane_name: item.lane_name,
        lane_id: item.lane_id,
        visiting_place_id: item.unit_id,
        status: item.approval_request_status,
        entry_time: item.timestamp,
        purpose_id: item.purpose_id,
        fr_image: item.fr_image,
        lane_type: item.lane_type,
      }));

      setVisitorData(filteredData);
      setData(filteredData);
    } catch (error) {
      console.error("Error fetching data visitor data: ", error);
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
    fetchVisitorData();
  }, [token, selectedLane, selectedStatus, refreshing]);

  const searchFilterFunction = (text) => {
    setSearch(text);
    const filteredData = visitorData.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.vehicle_number.toLowerCase().includes(text.toLowerCase())
    );
    setData(filteredData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSelectedLane("");
    setSelectedStatus("");
    await fetchData();
    await fetchVisitorData();
    setRefreshing(false);
  };

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

  const editItem = (item) => {
    navigation.navigate("EditNewPerson", { editData: item });
    console.log(item);
  };

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: "blue" }]}>
          Select Status
        </Text>
      );
    }
    return null;
  };

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

  const data_drop = [
    { label: "Waiting", value: 2 },
    { label: "Rejected", value: 0 },
  ];

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
          {search == "" ? null : (
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

      <View style={styles.container}>
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
        <View
          style={{
            marginTop: 10,
          }}
        >
          {renderLabel()}
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data_drop}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? "Select Status" : "..."}
            searchPlaceholder="Search..."
            value={selectedStatus} // Use the selectedStatus state variable here
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
              setValue(item);
              // Update selectedStatus based on the selected value
              setSelectedStatus(parseInt(item.value)); // Convert the value to an integer if needed
              setIsFocus(false);
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
              {item.vehicle_image ? (
                <Image
                  source={{ uri: `${API_Url}/img/${item.vehicle_image}` }}
                  style={{
                    width: 60,
                    height: "90%",
                    marginLeft: 10,
                    borderRadius: 10,
                  }}
                />
              ) : (
                <Image
                  source={{
                    uri: `${API_Url}/img/${item.fr_image}`,
                  }}
                  style={{
                    width: 60,
                    height: "90%",
                    marginLeft: 10,
                    borderRadius: 10,
                  }}
                />
              )}
              {/* Details */}
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ width: "80%", flex: 2 }}>
                  {item.lane_type == 1 ? null : (
                    <Text style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>Name:</Text>
                      <Text> {item.name}</Text>
                    </Text>
                  )}
                  {item.lane_type == 0 ? null : (
                    <Text style={{ marginLeft: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        Vehicle Number:
                      </Text>
                      <Text> {item.vehicle_number}</Text>
                    </Text>
                  )}
                  <Text style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Entry Time:</Text>
                    <Text> {formatDateTime(item.entry_time)}</Text>
                  </Text>
                  <Text style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Location:</Text>
                    <Text> {item.visiting_place}</Text>
                  </Text>
                  <Text style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Status:</Text>
                    {item.status === 0 && (
                      <Text style={{ color: "red" }}> Rejected</Text>
                    )}
                    {item.status === 1 && (
                      <Text style={{ color: "green" }}> Approved</Text>
                    )}
                    {item.status === 2 && (
                      <Text style={{ color: "#E1AD01" }}> Waiting</Text>
                    )}
                  </Text>
                </View>
                {/* Menu */}
                <MenuWrapper
                  onEdit={() => editItem(item)}
                  phoneNumber={item.phone_number}
                  visitorId={item.id}
                  handleRefresh={handleRefresh} // Pass handleRefresh as a prop
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Add new person button
      <TouchableOpacity style={styles.fab} onPress={removeToken}>
        <Icon
          family="entypo"
          size={35}
          name="plus"
          style={{
            color: "white",
          }}
        />
      </TouchableOpacity> */}
    </View>
  );
};

export default WaitingScreen;

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
  container: {
    // backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    paddingHorizontal: 8,
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
