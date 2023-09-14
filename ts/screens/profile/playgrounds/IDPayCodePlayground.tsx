import { Divider, IOStyles, ListItemNav } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

export const IDPayCodePlayGround = () => (
  <BaseScreenComponent goBack={true} headerTitle={"IDPay Code Playground"}>
    <View style={IOStyles.horizontalContentPadding}>
      <ListItemNav
        value={"Onboarding Start Screen"}
        accessibilityLabel="Result Screen"
        onPress={() => null}
      />
      <Divider />
      <ListItemNav
        value={"Result Screen"}
        accessibilityLabel="Result Screen"
        onPress={() => null}
      />
    </View>
  </BaseScreenComponent>
);
