import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { theme, Icon } from "galio-framework";

export default function CameraApp({ navigation, route }) {
  const { id } = route.params;
  let cameraRef = useRef();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const requestMediaLibraryPermission = async () => {
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    };

    requestMediaLibraryPermission();
  }, []);

  useEffect(() => {
    if (permission?.status !== undefined && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (permission === null || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  const savePhoto = async () => {
    const takenPicture = photo.base64;

    if (id === "personImage") {
      navigation.navigate("AnprFR", { takenPicture, id });
    } else if (id === "onlyPersonImage") {
      navigation.navigate("FRSetup", { takenPicture, id });
    } else if (id === "onlyVehicleImage") {
      navigation.navigate("AddNewPerson", { takenPicture, id });
    } else if (id === "vehicleImage") {
      navigation.navigate("AnprFR", { takenPicture, id });
    }
  };

  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <Image
          style={styles.preview}
          source={{ uri: `data:image/jpeg;base64,${photo.base64}` }}
        />
        <View style={styles.selectionOfImage}>
          {hasMediaLibraryPermission && (
            <TouchableOpacity
              onPress={() => setPhoto(null)}
              style={styles.customButtonTwo}
            >
              <Icon
                name="cross"
                family="entypo"
                size={30}
                style={{ color: "red" }}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={savePhoto} style={styles.customButtonTwo}>
            <Icon
              name="check"
              family="entypo"
              size={30}
              style={{ color: "green" }}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <CameraView style={styles.container} ref={cameraRef}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={takePic} style={styles.customButton}>
          <Icon
            name="camera"
            family="entypo"
            size={22}
            style={{ color: "white" }}
          />
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </CameraView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  buttonContainer: {
    alignSelf: "center",
  },
  preview: {
    alignSelf: "stretch",
    flex: 1,
  },
  customButton: {
    backgroundColor: "red",
    width: 70,
    height: 70,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    margin: 15,
  },
  selectionOfImage: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  button: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  customButtonTwo: {
    backgroundColor: "white",
    marginVertical: theme.SIZES.BASE,
    borderRadius: 70,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
    alignItems: "center",
    width: 70,
    height: 70,
    display: "flex",
    justifyContent: "center",
  },
});
