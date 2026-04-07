import {
  ContentWrapper,
  Divider,
  ListItemNav,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useState } from "react";
import { ScrollView } from "react-native";

import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IdPayCodeRoutes } from "../../../idpay/code/navigation/routes";

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
          accessibilityHint="Insert the initiative ID"
          accessibilityLabel="Initiative ID"
          autoFocus
          onChangeText={text => setInitiativeId(text)}
          placeholder="Initiative ID (optional)"
          value={initiativeId ?? ""}
        />
        <VSpacer size={16} />
        <ListItemNav
          accessibilityLabel="Code Onboarding Screen"
          description={
            "IdPay code generation and enrollment (if Initiative ID is configured)"
          }
          onPress={navigateToOnboarding}
          value={"Code Onboarding"}
        />
        <Divider />
        <ListItemNav
          accessibilityLabel="Code Renew Screen"
          description={"IdPay Code is generated again"}
          onPress={navigateToRenew}
          value={"Code Renew"}
        />
      </ContentWrapper>
    </ScrollView>
  );
};
