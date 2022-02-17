import React from "react";
import { Text } from "react-native";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";

const OptInPaymentMethodsCardsSelectionScreen = () => (
  <BaseScreenComponent
    showInstabugChat={false}
    goBack={false}
    headerTitle="Cards selection"
    customRightIcon={{
      iconName: "",
      onPress: () => true
    }}
    customGoBack={
      <ButtonDefaultOpacity onPress={() => true} transparent={true} />
    }
  >
    <Text>Cards selection</Text>
  </BaseScreenComponent>
);

export default OptInPaymentMethodsCardsSelectionScreen;
