import { Divider, ListItemNav } from "@pagopa/io-app-design-system";
import { List } from "native-base";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import { shufflePinPadOnPayment } from "../../config";
import { IdPayCodeRoutes } from "../../features/idpay/code/navigation/routes";
import { isIdPayCodeOnboardedSelector } from "../../features/idpay/code/store/selectors";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";
import ROUTES from "../../navigation/routes";
import { identificationRequest } from "../../store/actions/identification";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { isIdPayEnabledSelector } from "../../store/reducers/backendStatus";
import { isFingerprintEnabledSelector } from "../../store/reducers/persistedPreferences";
import { useScreenReaderEnabled } from "../../utils/accessibility";
import { getFlowType } from "../../utils/analytics";
import {
  biometricAuthenticationRequest,
  getBiometricsType,
  isBiometricsValidType,
  mayUserActivateBiometric
} from "../../utils/biometrics";
import { showToast } from "../../utils/showToast";
import {
  trackBiometricActivationAccepted,
  trackBiometricActivationDeclined
} from "../onboarding/biometric&securityChecks/analytics";
import {
  IOStackNavigationProp,
  useIONavigation
} from "../../navigation/params/AppParamsList";
import { IdPayCodeParamsList } from "../../features/idpay/code/navigation/params";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

const SecurityScreen = (): React.ReactElement => {
  const dispatch = useIODispatch();
  const isFingerprintEnabled = useIOSelector(isFingerprintEnabledSelector);
  const navigation =
    useNavigation<IOStackNavigationProp<IdPayCodeParamsList>>();
  const commonNavigation = useIONavigation();
  const isScreenReaderEnabled = useScreenReaderEnabled();
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);
  const isIdPayCodeOnboarded = useIOSelector(isIdPayCodeOnboardedSelector);

  const idPayCodeHandler = () => {
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
  };

  const requestIdentificationAndResetPin = useCallback(() => {
    const onSuccess = () => {
      void mixpanelTrack("UPDATE_PIN");
      commonNavigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
        screen: ROUTES.PIN_SCREEN
      });
    };

    dispatch(
      identificationRequest(
        true,
        false,
        undefined,
        undefined,
        {
          onSuccess
        },
        shufflePinPadOnPayment
      )
    );
  }, [commonNavigation, dispatch]);

  const setFingerprintPreference = useCallback(
    (fingerprintPreference: boolean) =>
      dispatch(
        preferenceFingerprintIsEnabledSaveSuccess({
          isFingerprintEnabled: fingerprintPreference
        })
      ),
    [dispatch]
  );
  useEffect(() => {
    getBiometricsType().then(
      biometricsType => {
        setIsFingerprintAvailable(isBiometricsValidType(biometricsType));
      },
      _ => undefined
    );
  }, []);

  // FIXME: Add alert if user refused IOS biometric permission on
  // the first time the app is opened: https://pagopa.atlassian.net/browse/IA-67

  const setBiometricPreference = (biometricPreference: boolean): void => {
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
        showToast(
          I18n.t(
            "profile.security.list.biometric_recognition.needed_to_disable"
          ),
          "danger"
        )
    );
  };

  return (
    <RNavScreenWithLargeHeader
      title={I18n.t("profile.security.title")}
      description={I18n.t("profile.security.subtitle")}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["profile", "privacy", "authentication_SPID"]}
    >
      <List withContentLateralPadding>
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
        <Divider />
        {isIdPayEnabled && (
          /* Reset IDPay code */
          <>
            <ListItemNav
              value={I18n.t("idpay.code.reset.title")}
              accessibilityLabel={I18n.t("idpay.code.reset.title")}
              description={I18n.t("idpay.code.reset.body")}
              onPress={idPayCodeHandler}
              testID="reset-idpay-code"
            />
            <Divider />
          </>
        )}

        {/* Enable/disable biometric recognition */}
        {isFingerprintAvailable && (
          <ListItemComponent
            title={I18n.t("profile.security.list.biometric_recognition.title")}
            subTitle={I18n.t(
              "profile.security.list.biometric_recognition.subtitle"
            )}
            // if the screen reader is disabled, the user can enable/disable
            // the biometric recognition only by pressing the switch
            onSwitchValueChanged={
              !isScreenReaderEnabled
                ? () => setBiometricPreference(!isFingerprintEnabled)
                : undefined
            }
            switchValue={isFingerprintEnabled}
            isLongPressEnabled
            accessibilityState={{ checked: isFingerprintEnabled }}
            accessibilityRole="switch"
            // if the screen reader is enabled, the user can enable/disable
            // the biometric recognition only by pressing the whole ListItemComponent
            onPress={
              isScreenReaderEnabled
                ? () => setBiometricPreference(!isFingerprintEnabled)
                : undefined
            }
            testID="biometric-recognition"
          />
        )}
      </List>
    </RNavScreenWithLargeHeader>
  );
};

export default SecurityScreen;
