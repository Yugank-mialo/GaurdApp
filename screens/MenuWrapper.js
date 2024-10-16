import React, { useState, useEffect } from "react";
import { Menu, IconButton, Divider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_Url, API_Url1, API_Url2 } from "../utils/API";

const MenuWrapper = ({ onEdit, visitorId, handleRefresh, ...props }) => {
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
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

    fetchToken();
  }, []);

  const closeMenu = () => setVisible(false);
  const openMenu = () => setVisible(true);

  const handleUpdateRequest = async (visitorId, requestStatus) => {
    try {
      const response = await axios.post(
        `${API_Url2}/update_request`,
        {
          visitor_id: visitorId,
          request_status: requestStatus,
        },
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      console.log("Update request response:", response.data);
      // Handle success response if needed
      // Trigger handleRefresh after successfully updating request
      handleRefresh();
    } catch (error) {
      console.error("Error updating request:", error);
      if (error.response.status == 401) {
        Alert.alert("Error", "Your session expired please login again");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        Alert.alert("Error", "Failed to add visitor. Please try again later.");
      }
      // Handle error
    }
  };

  const handleClickAccept = () => {
    handleUpdateRequest(visitorId, 1);
    closeMenu();
  };

  const handleClickReject = () => {
    handleUpdateRequest(visitorId, 0);
    closeMenu();
  };

  const handleClickEdit = () => {
    onEdit();
    closeMenu();
  };

  const handleClickCall = () => {
    console.log("Hello");
    closeMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<IconButton {...props} icon="dots-vertical" onPress={openMenu} />}
      style={{ backgroundColor: "white" }}
    >
      <Menu.Item
        onPress={handleClickAccept}
        title="Accept"
        style={{ backgroundColor: "white", color: "black" }}
      />
      <Divider style={{ height: 1, color: "black", width: "100%" }} />
      <Menu.Item
        onPress={handleClickReject}
        title="Reject"
        style={{ backgroundColor: "white", color: "black" }}
      />
      <Divider style={{ height: 1, color: "black", width: "100%" }} />
      <Menu.Item
        onPress={handleClickEdit}
        title="Edit"
        style={{ backgroundColor: "white", color: "black" }}
      />
      <Divider style={{ height: 1, color: "black", width: "100%" }} />
      <Menu.Item
        onPress={handleClickCall}
        title="Call"
        style={{ backgroundColor: "white", color: "black" }}
      />
    </Menu>
  );
};

export default MenuWrapper;
