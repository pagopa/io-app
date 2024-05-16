import React from "react";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export const MessagesHomeScreen = () => (
  <View style={styles.container}>
    <Text>{"Questa sezione è in fase di sviluppo"}</Text>
  </View>
);
