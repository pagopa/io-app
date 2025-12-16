import {
  ContentWrapper,
  Divider,
  ListItemNav,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { ScrollView } from "react-native";
import { IdPayCodeRoutes } from "../../../idpay/code/navigation/routes";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

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

  useHeaderSecondLevel({
    title: "IdPay Code Playground",
    canGoBack: true
  });

  return (
    <ScrollView>
      <ContentWrapper>
        <TextInput
          onChangeText={text => setInitiativeId(text)}
          value={initiativeId ?? ""}
          placeholder="Initiative ID (optional)"
          autoFocus
          accessibilityHint="Insert the initiative ID"
          accessibilityLabel="Initiative ID"
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
      </ContentWrapper>
    </ScrollView>
  );
};
