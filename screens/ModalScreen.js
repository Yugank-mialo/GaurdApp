import React, { useState, useEffect } from "react";
import { TextInput } from "react-native-paper";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";

import { Block, Button, theme, Icon } from "galio-framework";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_Url } from "../utils/API";

const { height, width } = Dimensions.get("screen");

const ModalScreen = ({ f }) => {
  const [text, setText] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // State for controlling modal visibility
  const [personImage, setPersonImage] = useState("");
  const [vechileImage, setVechileImage] = useState("");
  const [modalVisibles, setModalVisibles] = useState(false);
  const [laneType, setLaneType] = useState(2);

  const route = useRoute();
  const navigation = useNavigation();
  const receivedData = route.params?.personData || null;

  console.log(receivedData);

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

  useEffect(() => {
    if (receivedData.fr_image || receivedData.vehicle_image) {
      setPersonImage(receivedData.fr_image);
      setVechileImage(receivedData.vehicle_image);
      setLaneType(receivedData.lane_type);
    }
  }, [receivedData]);

  const getImageSource = () => {
    if (laneType === 0) {
      return require("./person.jpg");
    } else if (laneType === 1) {
      return require("./images.jpeg");
    } else {
      return require("./person.jpg");
    }
  };

  return (
    <View style={{ flexGrow: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon
              family="ArgonExtra"
              name="arrow-back"
              size={30}
              color="#fff"
              onPress={() => navigation.goBack()}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <View style={{ padding: 10, alignItems: "center" }}></View>
          {/* <TouchableOpacity onPress={() => setModalVisible(true)}>
            {receivedData.vehicle_image ? (
              <Image
                style={{
                  top: 25,
                  height: 200,
                  width: width - 32,
                  resizeMode: "contain",
                }}
                source={{
                  uri: `${API_Url}/img/${receivedData.vehicle_image}`,
                }}
              />
            ) : (
              <Image
                style={{
                  top: 25,
                  height: 200,
                  width: width - 32,
                  resizeMode: "contain",
                }}
                source={{
                  uri: `${API_Url}/img/${receivedData.fr_image}`,
                }}
              />
            )}
          </TouchableOpacity>

          Modal for displaying the image in full size
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
              {receivedData.vehicle_image ? (
                <Image
                  style={styles.fullSizeImage}
                  source={{
                    uri: `${API_Url}/img/${receivedData.vehicle_image}`,
                  }}
                />
              ) : (
                <Image
                  style={styles.fullSizeImage}
                  source={{
                    uri: `${API_Url}/img/${receivedData.fr_image}`,
                  }}
                />
              )}
            </View>
          </Modal> */}

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {/*left side*/}
            {receivedData.lane_type == 2 ? (
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
                        uri: `${API_Url}/img/${vechileImage}`,
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
                          uri: `${API_Url}/img/${vechileImage}`,
                        }}
                      />
                    ) : (
                      <Image
                        source={require("./person.jpg")}
                        style={styles.fullSizeImage}
                      />
                    )}
                  </View>
                </Modal>
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
                      uri: `${API_Url}/img/${personImage}`,
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setModalVisibles(true)}>
                  <Image source={getImageSource()} style={styles.ImageStyle} />
                </TouchableOpacity>
              )}
              {/* Modal for displaying the image in full size */}
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
                        uri: `${API_Url}/img/${personImage}`,
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
            </View>
          </View>
          {/* End of modal */}
          <View style={{ alignItems: "center", flexGrow: 1 }}>
            <View style={styles.card}>
              {receivedData.lane_type == 0 ? null : (
                <Text style={styles.textbox}>
                  <Text style={styles.key}>Vehicle Number:</Text>
                  <Text style={styles.value}>
                    {" "}
                    {receivedData.vehicle_number}
                  </Text>
                </Text>
              )}
              <Text style={styles.textbox}>
                <Text style={styles.key}>Name:</Text>
                <Text style={styles.value}> {receivedData.name}</Text>
              </Text>
              <Text style={styles.textbox}>
                <Text style={styles.key}>Phone Number:</Text>
                <Text style={styles.value}> {receivedData.phone_number}</Text>
              </Text>
              <Text style={styles.textbox}>
                <Text style={styles.key}>Visiting Place:</Text>
                <Text style={styles.value}> {receivedData.visiting_place}</Text>
              </Text>
              <Text style={styles.textbox}>
                <Text style={styles.key}>Visiting Type:</Text>
                <Text style={styles.value}> {receivedData.visitor_type}</Text>
              </Text>
              <Text style={styles.textbox}>
                <Text style={styles.key}>Entry Time:</Text>
                <Text style={{ fontSize: 17, color: "green" }}>
                  {" "}
                  {formatDateTime(receivedData.entry_time)}
                </Text>
              </Text>
              <Text style={styles.textbox}>
                <Text style={styles.key}>Exit Time:</Text>
                <Text style={{ fontSize: 17, color: "red" }}>
                  {" "}
                  {receivedData.exit_time}
                </Text>
              </Text>
              {receivedData.authorization_status ? (
                <Text style={styles.textbox}>
                  <Text style={styles.key}>Status:</Text>
                  <Text
                    style={{
                      fontSize: 17,
                      color:
                        receivedData.authorization_status === "Authorized"
                          ? "green"
                          : "red",
                    }}
                  >
                    {" "}
                    {receivedData.authorization_status}
                  </Text>
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    height: "53%",
    alignItems: "center",
    paddingTop: 10,
  },
  header: {
    backgroundColor: "red",
    height: height * 0.05, // Adjust height based on screen size
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerText: {
    color: "#fff",
    fontSize: width > 600 ? 28 : 24, // Adjust font size for larger screens
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 15,
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
    width: width - theme.SIZES.BASE * 1.7,
    marginBottom: 50,
    top: 60,
  },
  card1: {
    backgroundColor: "white",
    marginVertical: theme.SIZES.BASE,
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
    width: width - theme.SIZES.BASE * 1.7,
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
  key: {
    fontSize: 20,
    fontWeight: "bold",
  },
  value: {
    fontSize: 17,
  },
  textbox: {
    marginVertical: 5,
  },
  ImageStyle: {
    top: 25,
    height: height > 1200 ? 500 : 200,
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
});

export default ModalScreen;
