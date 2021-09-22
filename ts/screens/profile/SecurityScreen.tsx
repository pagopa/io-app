import React, { FC, useEffect, useState } from "react";
import { List } from "native-base";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { updatePin } from "../../store/actions/pinset";
import { identificationRequest } from "../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../config";
import {
  biometricAuthenticationRequest,
  getBiometricsType,
  isBiometricsValidType
} from "../../utils/biometrics";
import { showToast } from "../../utils/showToast";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import { useScreenReaderEnabled } from "../../utils/accessibility";
import ScreenContent from "../../components/screens/ScreenContent";

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
      // if user asks to enable biometric then call enable action directly
      setFingerprintPreference(biometricPreference);
      return;
    }
    // if user asks to disable biometric recnognition is required to proceed
    void biometricAuthenticationRequest(
      () => setFingerprintPreference(biometricPreference),
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
