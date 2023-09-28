import { Divider, IOStyles, ListItemNav } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";

export const IdPayCodePlayGround = () => (
  <TopScreenComponent goBack={true} customGoBack={false} dark={false}>
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
      <Divider />
      <ListItemNav
        value={"Regenerate code"}
        accessibilityLabel="regenerate code"
        onPress={() => null} // navigate to code generation screen (IdPayCodeRenewScreen)
      />
    </View>
  </TopScreenComponent>
);
