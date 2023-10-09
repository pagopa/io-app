import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayCodeParamsList } from "../navigation/params";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayEnrollCode, idPayGenerateCode } from "../store/actions";
import { isIdPayCodeOnboardedSelector } from "../store/selectors";
import { useIdPayInfoCieBottomSheet } from "../components/IdPayInfoCieBottomSheet";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../../../config";
import { WizardScreen } from "../../../../components/screens/WizardScreen";

type IdPayCodeOnboardingRouteParams = {
  initiativeId?: string;
};

type IdPayCodeOnboardingRouteProps = RouteProp<
  IdPayCodeParamsList,
  "IDPAY_CODE_ONBOARDING"
>;

const IdPayCodeOnboardingScreen = () => {
  const route = useRoute<IdPayCodeOnboardingRouteProps>();
  // since the route is optional, we need to use the optional chaining operator
  const initiativeId = route.params?.initiativeId;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const { bottomSheet, present: presentCieBottomSheet } =
    useIdPayInfoCieBottomSheet();

  const isCodeOnboarded = useIOSelector(isIdPayCodeOnboardedSelector);

  /**
   * Callback to be called when the biometric authentication is successful
   */
  const onBiometricAuthenticationSuccess = () => {
    dispatch(idPayGenerateCode.request({ initiativeId }));
    navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_DISPLAY,
      params: {
        isOnboarding: true
      }
    });
  };

  /**
   * Request biometric authentication to the user
   */
  const requestBiometricAuthentication = () => {
    dispatch(
      identificationRequest(
        true,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: onBiometricAuthenticationSuccess
        },
        shufflePinPadOnPayment
      )
    );
  };

  /**
   * Callback to be called when the user presses the "Start" button
   */
  const handleContinue = () => {
    if (isCodeOnboarded && initiativeId !== undefined) {
      dispatch(idPayEnrollCode.request({ initiativeId }));
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    } else {
      requestBiometricAuthentication();
    }
  };

  return (
    <>
      <WizardScreen
        pictogram="cie"
        title={I18n.t("idpay.code.onboarding.title")}
        description={I18n.t("idpay.code.onboarding.description")}
        primaryButton={{
          label: I18n.t("idpay.code.onboarding.buttons.start"),
          accessibilityLabel: I18n.t("idpay.code.onboarding.buttons.start"),
          onPress: handleContinue,
          testID: "wizardPrimaryButtonTestID"
        }}
        actionButton={{
          label: I18n.t("idpay.code.onboarding.buttons.howItWorks"),
          accessibilityLabel: I18n.t(
            "idpay.code.onboarding.buttons.howItWorks"
          ),
          onPress: presentCieBottomSheet,
          testID: "wizardActionButtonTestID"
        }}
      />
      {bottomSheet}
    </>
  );
};

export { IdPayCodeOnboardingScreen };
export type { IdPayCodeOnboardingRouteParams };
