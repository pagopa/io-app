import { Divider, IOStyles, ListItemNav } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IdPayCodeRoutes } from "../../../features/idpay/code/navigation/routes";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";

export const IDPayCodePlayGround = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToOnboarding = () => {
    navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_ONBOARDING
    });
  };

  const navigateToRenew = () => {
    navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_RENEW
    });
  };

  return (
    <BaseScreenComponent goBack={true} headerTitle={"IDPay Code Playground"}>
      <View style={IOStyles.horizontalContentPadding}>
        <ListItemNav
          value={"Code Onboarding Screen"}
          accessibilityLabel="Code Onboarding Screen"
          onPress={navigateToOnboarding}
        />
        <Divider />
        <ListItemNav
          value={"Code Renew Screen"}
          accessibilityLabel="Code Renew Screen"
          onPress={navigateToRenew}
        />
      </View>
    </BaseScreenComponent>
  );
};
