import React from "react";
import { SafeAreaView, Text } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";

type Props = void;

export const PremiumMessagesOptInOutScreen = (_: Props) => (
  <SafeAreaView style={IOStyles.flex}>
    <Text>Premium Messages Opt-in/out</Text>
  </SafeAreaView>
);
