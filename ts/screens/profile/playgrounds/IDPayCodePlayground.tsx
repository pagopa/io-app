import { Divider, IOStyles, ListItemNav } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { IdPayCodeRoutes } from "../../../features/idpay/code/navigation/routes";

export const IDPayCodePlayGround = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  return (
    <TopScreenComponent goBack={true} customGoBack={false} dark={false}>
      <View style={IOStyles.horizontalContentPadding}>
        <ListItemNav
          value={"Onboarding Start Screen"}
          accessibilityLabel="Result Screen"
          onPress={() =>
            navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
              screen: IdPayCodeRoutes.IDPAY_CODE_ONBOARDING,
              params: {}
            })
          }
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
};
