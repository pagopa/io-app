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
import { ComponentRef, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IdPayCodeRoutes } from "../../../idpay/code/navigation/routes";
import { useInputFocus } from "../../../payments/checkout/hooks/useInputFocus";

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

  const textInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  useInputFocus(textInputRef);

  return (
    <ScrollView>
      <ContentWrapper>
        <TextInput
          onChangeText={text => setInitiativeId(text)}
          value={initiativeId ?? ""}
          placeholder="Initiative ID (optional)"
          ref={textInputRef}
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
