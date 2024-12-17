import {
  Divider,
  IOStyles,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { LabelledItem } from "../../../components/LabelledItem";
import { IdPayCodeRoutes } from "../../../features/idpay/code/navigation/routes";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";

export const IdPayCodePlayGround = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [initiativeId, setInitiativeId] = useState<string | undefined>();

  const navigateToOnboarding = () => {
    navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_ONBOARDING,
      params: {
        initiativeId: pipe(
          initiativeId,
          NonEmptyString.decode,
          O.fromEither,
          O.toUndefined
        )
      }
    });
  };

  const navigateToRenew = () => {
    navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_RENEW
    });
  };

  return (
    <TopScreenComponent goBack={true} headerTitle={"IdPay Code Playground"}>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <LabelledItem
            label={"Initiative ID (optional)"}
            inputProps={{
              keyboardType: "default",
              returnKeyType: "done",
              autoFocus: true,
              onChangeText: text => setInitiativeId(text),
              value: initiativeId
            }}
          />
          <VSpacer size={16} />
          <ListItemNav
            value={"Code Onboarding"}
            accessibilityLabel="Code Onboarding Screen"
            description={
              "IdPay code generation and enrollment (if Initiative ID is configured)"
            }
            onPress={navigateToOnboarding}
          />
          <Divider />
          <ListItemNav
            value={"Code Renew"}
            accessibilityLabel="Code Renew Screen"
            description={"IdPay Code is generated again"}
            onPress={navigateToRenew}
          />
        </View>
      </ScrollView>
    </TopScreenComponent>
  );
};
