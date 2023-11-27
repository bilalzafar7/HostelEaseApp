import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import * as Font from 'expo-font';


const RoomsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedcapcaity, setselectedcapcaity] = useState("");
  const [selectedbed, setselectedbed] = useState("");
  const [selectedpayment, setselectedpayment] = useState("");


  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'Vivan': require('../assets/fonts/VinaSans-Regular.ttf'),
        'Kdam' : require('../assets/fonts/KdamThmorPro-Regular.ttf'),
        'Bunge' : require('../assets/fonts/BungeeShade-Regular.ttf'),
        'Kanit': require('../assets/fonts/Kanit-Regular.ttf'),


        
      });
    };

    loadFont();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Available Rooms",
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "bold",
        fontFamily:'Kanit',
        color: "white",
      },
      headerStyle: {
        backgroundColor: "#c90644",
        height: 90,
        borderBottomColor: "transparent",
        shadowColor: "transparent",
      },
    });
  }, []);

  const [selected, setSelected] = useState([]);
  const filteredRooms = route.params.rooms.filter(
    (item) => item.person >= route.params.person
  );

  return (
    <>
      <ScrollView>
        {filteredRooms.map((item, index) => (
          <Pressable
            style={{ margin: 10, backgroundColor: "#f5e1e7", padding: 10 }}
            key={index}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#c90644", fontSize: 21,fontWeight:'bold', fontFamily:'Kanit' }}>
                {item.name}
              </Text>
              <AntDesign name="infocirlceo" size={24} color="#27AE61" />
            </View>
            <Text style={{ marginTop: 3, color: "green", fontSize: 18,fontFamily:'Kanit' }}>
            {item.bed}
            </Text>
            <Text style={{ color: "green", fontSize: 18, fontWeight: "500",fontFamily:'Kanit',marginTop:3 }}>
            Room Size: {item.size}square feet
            </Text>
            <Text style={{ color: "red", fontSize: 18, fontWeight: "bold",fontFamily:'Kanit',marginTop:3 }}>
              {item.person} person 
              <Text style={{ color: "red", fontSize: 18, fontWeight: "bold",fontFamily:'Kanit',marginTop:3,marginLeft:20 }}>
            {item.payment}
            </Text>
            <Text style={{ color: "red", fontSize: 18, fontWeight: "bold",fontFamily:'Kanit',marginTop:3,marginLeft:20 }}>
            Rs {route.params.newPrice}
            </Text>
            </Text>
        
            <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 14, fontFamily:'Kanit' }}>
              Facilities
            </Text>
            <View style={{ margin: 4, flexDirection: "row", flexWrap: "wrap" }}>
              {route.params.services.map((service, index) => (
                <Text
                  key={index}
                  style={{
                    textAlign: "center",
                    color: "orange",
                    borderColor: "orange",
                    borderWidth: 3,
                    marginHorizontal: 10,
                    marginVertical: 6,
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 16,
                    fontFamily: "Kanit",
                  }}
                >
                  {service}
                </Text>
              ))}
            </View>

            {selected.includes(item.name) ? (
              <Pressable
                style={{
                  borderColor: "#c90644",
                  backgroundColor: "#c90644",
                  borderWidth: 2,
                  width: "100%",
                  padding: 10,
                  marginTop:10,
                  borderRadius: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    marginLeft: "auto",
                    marginRight: "auto",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  SELECTED
                </Text>
                <Entypo
                  onPress={() => setSelected([])}
                  name="circle-with-cross"
                  size={30}
                  color="red"
                />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setSelected(item.name);
                  setSelectedItemId(item.id);
                  setselectedbed(item.bed);
                  setselectedcapcaity(item.person);
                  setselectedpayment(item.payment)
                }}
                style={{
                  borderColor: "orange",
                  backgroundColor: "white",
                  borderWidth: 3 ,
                  width: "100%",
                  padding: 12,
                  marginTop:10,
                  borderRadius: 5,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    marginLeft: "auto",
                    marginRight: "auto",
                    color: "orange",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  SELECT
                </Text>
              </Pressable>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {selected.length > 0 ? (
        <Pressable
          onPress={() =>
            navigation.navigate("Confirmation", {
              name: route.params.name,
              rating: route.params.rating,
              newPrice: route.params.newPrice,
              rooms: route.params.availableRooms,
              hostelId: route.params.hostelId,
              roomId: selectedItemId,
              place: route.params.place,
              availability:route.params.availability,
              roomname: selected,
              roomcapacity: selectedcapcaity,
              roombed: selectedbed,
              paymenttype: selectedpayment
              
            })
          }
          style={{
            backgroundColor: "#27AE61",
            bottom: 20,
            padding: 15,
            marginHorizontal: 10,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: 17,
            }}
          >
            RESERVE
          </Text>
        </Pressable>
      ) : null}
    </>
  );
};

export default RoomsScreen;

const styles = StyleSheet.create({});
