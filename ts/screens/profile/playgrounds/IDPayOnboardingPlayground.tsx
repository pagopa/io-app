import { useNavigation } from "@react-navigation/native";
import { ListItem } from "native-base";
import React from "react";
import { Button, SafeAreaView, ScrollView } from "react-native";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H4 } from "../../../components/core/typography/H4";
import { Monospace } from "../../../components/core/typography/Monospace";
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

  const testIDs = ["01GKPJXR35WKGMW8TH4NSP0RB9"];

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
              onChangeText: text => setServiceId(text),
              value: serviceId
            }}
          />
          <VSpacer size={16} />
          <Button
            onPress={navigateToIDPayOnboarding}
            title="Start onboarding"
          />
          <VSpacer size={24} />
          <H4>Test service IDs:</H4>
          {testIDs.map(id => (
            <ListItem key={id} onPress={() => setServiceId(id)}>
              <Monospace selectable>{id}</Monospace>
            </ListItem>
          ))}
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default IDPayOnboardingPlayground;
