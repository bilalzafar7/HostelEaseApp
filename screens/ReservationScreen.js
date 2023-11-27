import React, { useLayoutEffect, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useUserContext } from "../UserContext";
import { auth, db } from "../Firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import * as Font from "expo-font";
import { AntDesign } from "@expo/vector-icons";

const ReservationScreen = () => {
  const navigation = useNavigation();
  const { userId } = useUserContext();
  const [city, setCity] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [hostelData, setHostelData] = useState(null);
  const [selectedRoomData, setSelectedRoomData] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [userIDs, setUserIDs] = useState([]);
  const [userData, setUserData] = useState([]);
  const [userArrayLength, setUserArrayLength] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [currentUserName, setCurrentUserName] = useState("");

  const handleRate = () => {
    setIsModalVisible(false);
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Text style={i <= rating ? styles.starFilled : styles.starOutline}>
            &#9733;
          </Text>
        </TouchableOpacity>
      );
    }

    return stars;
  };

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        Vivan: require("../assets/fonts/VinaSans-Regular.ttf"),
        Kdam: require("../assets/fonts/KdamThmorPro-Regular.ttf"),
        Bunge: require("../assets/fonts/BungeeShade-Regular.ttf"),
        Kanit: require("../assets/fonts/Kanit-Regular.ttf"),
      });
    };

    loadFont();
  }, []);

  useEffect(() => {
    const fetchReservationData = async (userId) => {
      try {
        const reservationsQuery = query(
          collection(db, "reservations"),
          where("userId", "==", userId)
        );
        const reservationsSnapshot = await getDocs(reservationsQuery);

        if (!reservationsSnapshot.empty) {
          const reservationDoc = reservationsSnapshot.docs[0];
          const reservationData = reservationDoc.data();
          setCity(reservationData.city);
          setHostelId(reservationData.hostelId);
          setRoomId(reservationData.roomId);
          setPaymentStatus(reservationData.paymentStatus);
        } else {
          console.error("No matching reservation found for userId:", userId);
        }
      } catch (error) {
        console.error("Error fetching reservation data:", error.message);
      }
    };

    fetchReservationData(userId);
  }, [userId]);

  useEffect(() => {
    const fetchHostelData = async () => {
      try {
        const placesRef = collection(db, "places");
        const placesQuery = query(placesRef, where("place", "==", city));

        const placesSnapshot = await getDocs(placesQuery);

        if (!placesSnapshot.empty) {
          const data = placesSnapshot.docs[0].data();
          const properties = data.properties || [];

          const matchingProperty = properties.find(
            (property) => property.id === hostelId
          );

          if (matchingProperty) {
            setHostelData(matchingProperty);

            const matchingRoom = matchingProperty.rooms.find(
              (room) => room.id === roomId
            );

            if (matchingRoom) {
              setSelectedRoomData(matchingRoom);
            } else {
              console.log("No matching room found with id:", roomId);
            }
          } else {
            console.log("No matching property found with id:", hostelId);
          }
        } else {
          console.log("No matching document found.");
        }
      } catch (error) {
        console.error("Error fetching hostel data:", error);
      }
    };

    fetchHostelData();
  }, [city, hostelId, roomId]);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const announcementsRef = collection(db, "announcements");
        const announcementsQuery = query(
          announcementsRef,
          where("hostelId", "==", hostelId)
        );

        const announcementsSnapshot = await getDocs(announcementsQuery);

        if (!announcementsSnapshot.empty) {
          const announcementData = announcementsSnapshot.docs[0].data();
          setAnnouncement(announcementData.announcement);
        } else {
          setAnnouncement("No announcement available");
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };

    fetchAnnouncement();
  }, [hostelId]);

  useEffect(() => {
    fetchUsersInSameRoom();
  }, [city, hostelId, roomId]);

  const fetchUsersInSameRoom = async () => {
    try {
      const reservationsRef = collection(db, "reservations");
      const reservationsQuery = query(
        reservationsRef,
        where("city", "==", city),
        where("hostelId", "==", hostelId),
        where("roomId", "==", roomId)
      );

      const reservationsSnapshot = await getDocs(reservationsQuery);
      const collectedUserIDs = [];

      reservationsSnapshot.forEach((doc) => {
        const reservationData = doc.data();
        if (reservationData.userId) {
          collectedUserIDs.push(reservationData.userId);
        }
      });

      const filteredUserIDs = collectedUserIDs.filter(
        (userID) => userID !== userId
      );

      setUserIDs(filteredUserIDs);

      console.log(
        "User IDs in the same room (excluding current user):",
        filteredUserIDs
      );

      const userDataPromises = filteredUserIDs.map((userID) =>
        fetchUserData(userID)
      );
      const userArray = await Promise.all(userDataPromises);

      setUserData(userArray.flat());
      setUserArrayLength(userArray.flat().length);
    } catch (error) {
      alert("Error fetching users in the same room:", error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        return userData;
      } else {
        alert("User document not found for userID", userId);
        return null;
      }
    } catch (error) {
      alert("Error fetching user data for userID", userId, ":", error);
      return null;
    }
  };

  const fetchFirstName = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userFirstName = userData.firstName;

        setCurrentUserName(userFirstName);
      } else {
        alert("User document not found");
      }
    } catch (error) {
      alert("Error fetching user data:", error);
    }
  };

  fetchFirstName(userId);
  return (
    <>
      {hostelData && selectedRoomData && (
        <View style={{ flex: 1 }}>
          <ImageBackground
            source={{
              uri: hostelData
                ? hostelData.image
                : "https://www.hotelscombined.com/rimg/himg/a1/53/3e/expediav2-448841-9e0fd3-605126.jpg?width=1366&height=768&crop=true",
            }}
            style={{ flex: 1, height: "44%", resizeMode: "cover" }}
          >
            <TouchableOpacity
              style={{ position: "absolute", top: 20, left: 20, padding: 10 }}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="leftcircleo" size={32} color="gray" />
            </TouchableOpacity>
          </ImageBackground>

          <View
            style={{
              position: "absolute",
              top: "28%",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                paddingHorizontal: 20,
                marginHorizontal: 45,
                paddingTop: "4%",
                width: 464,
              }}
            >
              <View style={{ flexDirection: "row", gap: 9 }}>
                <Text
                  style={{
                    backgroundColor: "#c90644",
                    fontSize: 16,
                    color: "white",
                    fontFamily: "Kanit",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 5,
                  }}
                >
                  Payment:{" "}
                </Text>
                <Text
                  style={{
                    backgroundColor: "green",
                    fontSize: 16,
                    color: "white",
                    fontFamily: "Kanit",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 5,
                  }}
                >
                  {paymentStatus}
                </Text>
                <Text
                  style={{
                    backgroundColor: "#c90644",
                    fontSize: 16,
                    color: "white",
                    fontFamily: "Kanit",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 5,
                  }}
                >
                  Reservations Status
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    fontFamily: "Kdam",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    position: "absolute",
                    right: 1,
                  }}
                >
                  {hostelData.newPrice} Rs
                </Text>
              </View>

              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <Text
                  style={{
                    fontFamily: "Kanit",
                    fontSize: 27,
                    color: "orange",
                    fontWeight: "bold",
                  }}
                >
                  {hostelData.name}
                </Text>
              </View>

              <View>
                <Text
                  style={{ fontFamily: "Kanit", fontSize: 16, color: "gray" }}
                >
                  {city}
                </Text>
              </View>

              <View style={{ flexDirection: "row", marginTop: 10, gap: 24 }}>
                <Text
                  style={{
                    fontFamily: "Kanit",
                    fontSize: 20,
                    color: "orange",
                    fontWeight: "bold",
                  }}
                >
                  {selectedRoomData.name}
                </Text>
                {userArrayLength + 1 === selectedRoomData.person ? (
                  <Text
                    style={{
                      backgroundColor: "#c90644",
                      fontSize: 16,
                      color: "white",
                      fontFamily: "Kanit",
                      paddingHorizontal: 8,
                      paddingVertical: 1,
                      borderRadius: 5,
                    }}
                  >
                    Fully Reserved
                  </Text>
                ) : (
                  <Text
                    style={{
                      backgroundColor: "#c90644",
                      fontSize: 16,
                      color: "white",
                      fontFamily: "Kanit",
                      paddingHorizontal: 8,
                      paddingVertical: 1,
                      borderRadius: 5,
                    }}
                  >
                    Capacity {userArrayLength + 1}/{selectedRoomData.person}
                  </Text>
                )}
              </View>

              <View>
                <Text
                  style={{ fontFamily: "Kanit", fontSize: 16, color: "gray" }}
                >
                  {selectedRoomData.bed}
                </Text>
                <Text
                  style={{ fontFamily: "Kanit", fontSize: 16, color: "gray" }}
                >
                  {selectedRoomData.payment}
                </Text>
                <Text
                  style={{
                    fontFamily: "Kanit",
                    fontSize: 18,
                    color: "orange",
                    fontWeight: "800",
                    marginTop: 10,
                  }}
                >
                  Room Mates
                </Text>
              </View>

              <View style={{ flexDirection: "column" }}>
                {userData.map((user, index) => (
                  <Text
                    style={{
                      fontFamily: "Kanit",
                      fontSize: 16,
                      color: "#c90644",
                      marginHorizontal: 30,
                    }}
                    key={index}
                  >
                    {user.firstName} {user.lastName}
                  </Text>
                ))}
              </View>

              <View style={{ marginTop: 10 }}>
                <Text
                  style={{
                    fontFamily: "Kanit",
                    fontSize: 20,
                    color: "#c90644",
                    fontWeight: "bold",
                  }}
                >
                  Announcement
                </Text>
              </View>

              <View style={{ flexWrap: "wrap" }}>
                <Text
                  style={{
                    fontFamily: "Kanit",
                    fontSize: 16,
                    color: "green",
                    marginHorizontal: 30,
                  }}
                >
                  {announcement}
                </Text>
              </View>
              <Text> </Text>
            </View>
          </View>

          <Modal
            visible={isModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Rate this item</Text>
                <View style={styles.starContainer}>{renderStars()}</View>
                <TouchableOpacity onPress={handleRate}>
                  <Text style={styles.submitButton}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.submitButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View
            style={{
              flexDirection: "row",
              alignContent: "space-around",
              justifyContent: "space-around",
            }}
          >
            <Pressable
              onPress={() => {
                navigation.navigate("Complains", {
                  city: city,
                  hostelId: hostelId,
                  roomId: roomId,
                });
              }}
            >
              <Text
                style={{
                  color: "white",
                  padding: 10,
                  backgroundColor: "orange",
                  marginBottom: 20,
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: "Kanit",
                  fontWeight: "bold",
                  paddingHorizontal: 20,
                }}
              >
                Add a Complaint
              </Text>
            </Pressable>

            <Pressable onPress={() => setIsModalVisible(true)}>
              <Text
                style={{
                  color: "white",
                  padding: 10,
                  backgroundColor: "orange",
                  marginBottom: 20,
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: "Kanit",
                  fontWeight: "bold",
                  paddingHorizontal: 20,
                }}
              >
                Rate Experience
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate("Chat", {
                  city,
                  hostelId,
                  roomId,
                  currentUserName,
                  userId,
                })
              }
            >
              <Text
                style={{
                  color: "white",
                  padding: 10,
                  backgroundColor: "#c90644",
                  marginBottom: 20,
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: "Kanit",
                  fontWeight: "bold",
                  paddingHorizontal: 20,
                }}
              >
                Chat with roommates
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

export default ReservationScreen;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#e6e3e3",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Kanit",
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  starFilled: {
    fontSize: 30,
    color: "gold",
  },
  starOutline: {
    fontSize: 30,
    color: "gray",
  },
  submitButton: {
    color: "white",
    padding: 10,
    backgroundColor: "orange",
    marginBottom: 8,
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "Kanit",
    fontWeight: "bold",
    paddingHorizontal: 20,
    textAlign: "center",
  },
});
