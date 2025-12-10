import {
  ContentWrapper,
  Divider,
  IOToast,
  ListItemNav,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import { ReactElement, useCallback, useEffect, useState } from "react";

import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { shufflePinPadOnPayment } from "../../../../config";
import { mixpanelTrack } from "../../../../mixpanel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayCiePaymentCodeEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isFingerprintEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { getFlowType } from "../../../../utils/analytics";
import {
  biometricAuthenticationRequest,
  getBiometricsType,
  isBiometricsValidType,
  mayUserActivateBiometric
} from "../../../../utils/biometrics";
import { FAQsCategoriesType } from "../../../../utils/faq";
import { ContextualHelpPropsMarkdown } from "../../../../utils/contextualHelp";
import { FIMS_ROUTES } from "../../../fims/common/navigation";
import { fimsIsHistoryEnabledSelector } from "../../../fims/history/store/selectors";
import { identificationRequest } from "../../../identification/store/actions";
import { IdPayCodeRoutes } from "../../../idpay/code/navigation/routes";
import { isIdPayCodeOnboardedSelector } from "../../../idpay/code/store/selectors";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import {
  trackBiometricActivationAccepted,
  trackBiometricActivationDeclined
} from "../shared/analytics";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

const FAQ_CATEGORIES: ReadonlyArray<FAQsCategoriesType> = [
  "profile",
  "privacy",
  "authentication_SPID"
];

const SecurityScreen = (): ReactElement => {
  const dispatch = useIODispatch();
  const isFingerprintEnabled = useIOSelector(isFingerprintEnabledSelector);
  const isIdPayCodeOnboarded = useIOSelector(isIdPayCodeOnboardedSelector);
  const isIdPayCieCodeEnabled = useIOSelector(
    isIdPayCiePaymentCodeEnabledSelector
  );
  const isFimsHistoryEnabled = useIOSelector(fimsIsHistoryEnabledSelector);
  const navigation = useIONavigation();
  const [isBiometricDataAvailable, setIsBiometricDataAvailable] =
    useState(false);

  useEffect(() => {
    getBiometricsType().then(
      biometricsType => {
        setIsBiometricDataAvailable(isBiometricsValidType(biometricsType));
      },
      _ => undefined
    );
  }, []);

  const idPayCodeHandler = useCallback(() => {
    navigation.navigate(
      IdPayCodeRoutes.IDPAY_CODE_MAIN,
      isIdPayCodeOnboarded
        ? {
            screen: IdPayCodeRoutes.IDPAY_CODE_RENEW
          }
        : {
            screen: IdPayCodeRoutes.IDPAY_CODE_ONBOARDING,
            params: {
              initiativeId: undefined
            }
          }
    );
  }, [navigation, isIdPayCodeOnboarded]);

  const requestIdentificationAndResetPin = useCallback(() => {
    const onSuccess = () => {
      void mixpanelTrack("UPDATE_PIN");
      navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.PIN_SCREEN
      });
    };

    dispatch(
      identificationRequest(
        true,
        true,
        undefined,
        undefined,
        {
          onSuccess
        },
        shufflePinPadOnPayment
      )
    );
  }, [navigation, dispatch]);

  const setFingerprintPreference = useCallback(
    (fingerprintPreference: boolean) =>
      dispatch(
        preferenceFingerprintIsEnabledSaveSuccess({
          isFingerprintEnabled: fingerprintPreference
        })
      ),
    [dispatch]
  );

  // FIXME: Add alert if user refused IOS biometric permission on
  // the first time the app is opened: https://pagopa.atlassian.net/browse/IA-67
  const setBiometricPreference = useCallback(
    (biometricPreference: boolean): void => {
      if (biometricPreference) {
        void mayUserActivateBiometric()
          .then(_ => {
            trackBiometricActivationAccepted(getFlowType(false, false));
            setFingerprintPreference(biometricPreference);
          })
          .catch(_ => undefined);

        return;
      }
      // if user asks to disable biometric recnognition is required to proceed
      void biometricAuthenticationRequest(
        () => {
          trackBiometricActivationDeclined(getFlowType(false, false));
          setFingerprintPreference(biometricPreference);
        },
        _ =>
          IOToast.error(
            I18n.t(
              "profile.security.list.biometric_recognition.needed_to_disable"
            )
          )
      );
    },
    [setFingerprintPreference]
  );

  const onSwitchValueChange = useCallback(
    () => setBiometricPreference(!isFingerprintEnabled),
    [isFingerprintEnabled, setBiometricPreference]
  );

  const fimsHistoryHandler = useCallback(() => {
    navigation.navigate(FIMS_ROUTES.MAIN, {
      screen: FIMS_ROUTES.HISTORY
    });
  }, [navigation]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.security.title")
      }}
      description={I18n.t("profile.security.subtitle")}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={FAQ_CATEGORIES}
    >
      <ContentWrapper>
        {/* Ask for verification and reset unlock code */}
        <ListItemNav
          value={I18n.t("identification.unlockCode.reset.button_short")}
          accessibilityLabel={I18n.t(
            "identification.unlockCode.reset.button_short"
          )}
          description={I18n.t("identification.unlockCode.reset.subtitle")}
          onPress={requestIdentificationAndResetPin}
          testID="reset-unlock-code"
        />
        {isIdPayCieCodeEnabled && (
          /* Reset IDPay code */
          <>
            <Divider />
            <ListItemNav
              value={I18n.t("idpay.code.reset.title")}
              accessibilityLabel={I18n.t("idpay.code.reset.title")}
              description={I18n.t("idpay.code.reset.body")}
              onPress={idPayCodeHandler}
              testID="reset-idpay-code"
            />
          </>
        )}
        {/* Enable/disable biometric recognition */}
        {isBiometricDataAvailable && (
          <>
            <Divider />
            <ListItemSwitch
              label={I18n.t(
                "profile.security.list.biometric_recognition.title"
              )}
              description={I18n.t(
                "profile.security.list.biometric_recognition.subtitle"
              )}
              onSwitchValueChange={onSwitchValueChange}
              value={isFingerprintEnabled}
              testID="biometric-recognition"
            />
          </>
        )}
        {/* FIMS History log */}
        {isFimsHistoryEnabled && (
          <>
            <Divider />
            <ListItemNav
              value={I18n.t("FIMS.history.profileCTA.title")}
              description={I18n.t("FIMS.history.profileCTA.subTitle")}
              onPress={fimsHistoryHandler}
              testID="fims-history"
            />
          </>
        )}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default SecurityScreen;
