import {
  Body,
  ButtonSolid,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { ScrollView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayCodeParamsList } from "../navigation/params";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayEnrollCode, idPayGenerateCode } from "../store/actions";
import { isIdPayCodeOnboardedSelector } from "../store/selectors";

type IdPayCodeOnboardingRouteParams = {
  initiativeId?: string;
};

type IdPayCodeOnboardingRouteProps = RouteProp<
  IdPayCodeParamsList,
  "IDPAY_CODE_ONBOARDING"
>;

const IdPayCodeOnboardingScreen = () => {
  const route = useRoute<IdPayCodeOnboardingRouteProps>();
  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const isCodeOnboarded = useIOSelector(isIdPayCodeOnboardedSelector);

  const handleContinue = () => {
    if (isCodeOnboarded && initiativeId !== undefined) {
      dispatch(idPayEnrollCode.request({ initiativeId }));
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    } else {
      dispatch(idPayGenerateCode.request({ initiativeId }));
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_DISPLAY,
        params: {
          isOnboarding: true
        }
      });
    }
  };

  return (
    <BaseScreenComponent headerTitle="IdPay Code Onboarding" goBack={true}>
      <ScrollView
        centerContent={true}
        contentContainerStyle={IOStyles.horizontalContentPadding}
      >
        <Body>
          Code status: {isCodeOnboarded ? "Generated ✅" : "Not generated ❌"}
        </Body>
        <Body>Initiative ID: {initiativeId}</Body>
        <VSpacer size={32} />
        <ButtonSolid
          fullWidth={true}
          label="Inizia"
          accessibilityLabel="Inizia"
          onPress={handleContinue}
        />
      </ScrollView>
    </BaseScreenComponent>
  );
};

export { IdPayCodeOnboardingScreen };
export type { IdPayCodeOnboardingRouteParams };
