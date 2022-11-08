import { useNavigation } from "@react-navigation/native";
import { View } from "native-base";
import React from "react";
import { Button, SafeAreaView, ScrollView, Text } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { LabelledItem } from "../../../components/LabelledItem";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IDPayOnboardingRoutes } from "../../../features/idpay/onboarding/navigation/navigator";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";

const IDPayOnboardingPlayground = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [serviceId, setServiceId] = React.useState<string | undefined>();

  const navigateToIDPayOnboarding = () => {
    if (serviceId !== undefined && serviceId !== "") {
      navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
        screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
        params: {
          serviceId
        }
      });
    }
  };

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Playground"}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <LabelledItem
            label={"Service ID"}
            inputProps={{
              keyboardType: "default",
              returnKeyType: "done",
              autoFocus: true,
              onChangeText: text => setServiceId(text)
            }}
          />
          <View spacer={true} />
          <Button
            onPress={navigateToIDPayOnboarding}
            title="Start onboarding"
          />
          <View spacer={true} />
          <Text selectable>{`
          Test service IDs:

          01GH187R1S8W4XG810STWXWBF3

          01GH1879JD77Y9FB51DQH7DK05

          01GH187HQ4JAGRGC7010GVBGCV

          `}</Text>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default IDPayOnboardingPlayground;
