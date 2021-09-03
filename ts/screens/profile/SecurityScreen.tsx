import React, { FC, useEffect, useState } from "react";
import { List } from "native-base";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FingerprintScanner, {
  AuthenticateAndroid,
  AuthenticateIOS
} from "react-native-fingerprint-scanner";
import { Platform } from "react-native";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { updatePin } from "../../store/actions/pinset";
import { identificationRequest } from "../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../config";
import { authenticateConfig } from "../../utils/biometric";
import { showToast } from "../../utils/showToast";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import { useScreenReaderEnabled } from "../../utils/accessibility";
import ScreenContent from "../../components/screens/ScreenContent";
import { mixpanelTrack } from "../../mixpanel";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const SecurityScreen: FC<Props> = ({
  isFingerprintEnabled,
  requestIdentificationAndResetPin,
  setFingerprintPreference
}): React.ReactElement => {
  const isScreenReaderEnabled = useScreenReaderEnabled();
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);

  useEffect(() => {
    getFingerprintSettings().then(
      biometryTypeOrUnsupportedReason => {
        setIsFingerprintAvailable(
          biometryTypeOrUnsupportedReason !== "UNAVAILABLE"
        );
      },
      _ => undefined
    );
  }, []);

  // FIXME: Add alert if user refused IOS biometric permission on
  // the first time the app is opened: https://pagopa.atlassian.net/browse/IA-67

  const setBiometricPreference = (biometricPreference: boolean): void => {
    if (biometricPreference) {
      // if user asks to enable biometric then call enable action directly
      setFingerprintPreference(biometricPreference);
      return;
    }
    // if user asks to disable biometric recnognition is required to proceed
    FingerprintScanner.authenticate(
      Platform.select({
        ios: {
          description: I18n.t(
            "identification.biometric.popup.sensorDescription"
          ),
          fallbackEnabled: true
        } as AuthenticateIOS,
        default: {
          title: authenticateConfig.title,
          description: I18n.t(
            "identification.biometric.popup.sensorDescription"
          ),
          cancelButton: I18n.t("global.buttons.cancel")
        } as AuthenticateAndroid
      })
    )
      .then(() => {
        setFingerprintPreference(biometricPreference);
        void FingerprintScanner.release();
      })
      .catch(e => {
        void mixpanelTrack("BIOMETRIC_ERROR", { error: e });
        showToast(
          I18n.t(
            "profile.security.list.biometric_recognition.needed_to_disable"
          ),
          "danger"
        );
        void FingerprintScanner.release();
      });
  };

  return (
    <TopScreenComponent
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      goBack
    >
      <ScreenContent
        title={I18n.t("profile.security.title")}
        subtitle={I18n.t("profile.security.subtitle")}
      >
        <List withContentLateralPadding>
          {/* Ask for verification and reset unlock code */}
          <ListItemComponent
            title={I18n.t("identification.unlockCode.reset.button_short")}
            subTitle={I18n.t("identification.unlockCode.reset.subtitle")}
            onPress={requestIdentificationAndResetPin}
            testID="reset-unlock-code"
          />
          {/* Enable/disable biometric recognition */}
          {isFingerprintAvailable && (
            <ListItemComponent
              title={I18n.t(
                "profile.security.list.biometric_recognition.title"
              )}
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
      </ScreenContent>
    </TopScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestIdentificationAndResetPin: () => {
    const onSuccess = () => dispatch(updatePin());

    return dispatch(
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
  },
  setFingerprintPreference: (fingerprintPreference: boolean) =>
    dispatch(
      preferenceFingerprintIsEnabledSaveSuccess({
        isFingerprintEnabled: fingerprintPreference
      })
    )
});

const mapStateToProps = (state: GlobalState) => ({
  isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled
});

export default connect(mapStateToProps, mapDispatchToProps)(SecurityScreen);
