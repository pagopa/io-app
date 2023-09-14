import { Divider, IOStyles, ListItemNav } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IDPayCodeOnboardingRoutes } from "../../../features/idpay/codeOnboarding/navigation";

export const IDPayCodePlayGround = () => {
  const navigation = useNavigation();

  return (
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
        <Divider />
        <ListItemNav
          value={"Full Flow"}
          accessibilityLabel=" Full Flow"
          onPress={() =>
            navigation.navigate(
              IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_MAIN
            )
          }
        />
      </View>
    </BaseScreenComponent>
  );
};
