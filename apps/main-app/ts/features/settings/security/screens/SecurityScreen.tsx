import {
  ContentWrapper,
  Divider,
  IOToast,
  ListItemNav,
  ListItemSwitch
} from "@io-app/design-system";
import I18n from "i18next";
import { ReactElement, useCallback, useEffect, useState } from "react";

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
import { ContextualHelpPropsMarkdown } from "../../../../utils/contextualHelp";
import { FAQsCategoriesType } from "../../../../utils/faq";
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
      contextualHelpMarkdown={contextualHelpMarkdown}
      description={I18n.t("profile.security.subtitle")}
      faqCategories={FAQ_CATEGORIES}
      headerActionsProp={{ showHelp: true }}
      title={{
        label: I18n.t("profile.security.title")
      }}
    >
      <ContentWrapper>
        {/* Ask for verification and reset unlock code */}
        <ListItemNav
          accessibilityLabel={I18n.t(
            "identification.unlockCode.reset.button_short"
          )}
          description={I18n.t("identification.unlockCode.reset.subtitle")}
          onPress={requestIdentificationAndResetPin}
          testID="reset-unlock-code"
          value={I18n.t("identification.unlockCode.reset.button_short")}
        />
        {isIdPayCieCodeEnabled && (
          /* Reset IDPay code */
          <>
            <Divider />
            <ListItemNav
              accessibilityLabel={I18n.t("idpay.code.reset.title")}
              description={I18n.t("idpay.code.reset.body")}
              onPress={idPayCodeHandler}
              testID="reset-idpay-code"
              value={I18n.t("idpay.code.reset.title")}
            />
          </>
        )}
        {/* Enable/disable biometric recognition */}
        {isBiometricDataAvailable && (
          <>
            <Divider />
            <ListItemSwitch
              description={I18n.t(
                "profile.security.list.biometric_recognition.subtitle"
              )}
              label={I18n.t(
                "profile.security.list.biometric_recognition.title"
              )}
              onSwitchValueChange={onSwitchValueChange}
              testID="biometric-recognition"
              value={isFingerprintEnabled}
            />
          </>
        )}
        {/* FIMS History log */}
        {isFimsHistoryEnabled && (
          <>
            <Divider />
            <ListItemNav
              description={I18n.t("FIMS.history.profileCTA.subTitle")}
              onPress={fimsHistoryHandler}
              testID="fims-history"
              value={I18n.t("FIMS.history.profileCTA.title")}
            />
          </>
        )}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default SecurityScreen;
