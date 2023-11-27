import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { ModalPortal } from "react-native-modals";
import { Provider } from "react-redux";
import store from "./store";
import { UserProvider } from "./UserContext";

export default function App() {
  return (
    <>
      <UserProvider>
        <Provider store={store}>
        <StackNavigator />
        <ModalPortal />
      </Provider>
      </UserProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
