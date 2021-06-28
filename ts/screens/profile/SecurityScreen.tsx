import React, { FC, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { List, Content, View } from "native-base";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import TouchID, { AuthenticationError } from "react-native-touch-id";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { H1 } from "../../components/core/typography/H1";
import { H3 } from "../../components/core/typography/H3";
import { H4 } from "../../components/core/typography/H4";
import Switch from "../../components/ui/Switch";
import { updatePin } from "../../store/actions/pinset";
import { identificationRequest } from "../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../config";
import { authenticateConfig } from "../../utils/biometric";
import { showToast } from "../../utils/showToast";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import customVariables from "../../theme/variables";

const styles = StyleSheet.create({
  containerScreenTitle: {
    paddingHorizontal: customVariables.contentPadding
  },
  containerBiometricAuth: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderColor: customVariables.itemSeparator,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  containerBiometricAuthTitle: {
    flexDirection: "column",
    paddingRight: 24
  },
  switch: {
    marginTop: 0,
    marginBottom: 0
  }
});

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
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);

  useEffect(() => {
    getFingerprintSettings().then(
      biometryTypeOrUnsupportedReason => {
        setIsFingerprintAvailable(
          biometryTypeOrUnsupportedReason !== "UNAVAILABLE" &&
            biometryTypeOrUnsupportedReason !== "NOT_ENROLLED"
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
    TouchID.authenticate(
      I18n.t("identification.biometric.popup.title"),
      authenticateConfig
    )
      .then(() => setFingerprintPreference(biometricPreference))
      .catch((_: AuthenticationError) =>
        // this toast will be show either if recognition fails (mismatch or user aborts)
        // or if meanwhile user disables biometric recognition in OS settings
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
      <Content noPadded>
        <View style={styles.containerScreenTitle}>
          <H1>{I18n.t("profile.security.title")}</H1>
          <H4 color="bluegrey" weight="Regular">
            {I18n.t("profile.security.subtitle")}
          </H4>
        </View>
        <View spacer />
        <List withContentLateralPadding>
          {/* Ask for verification and reset unlock code */}
          <ListItemComponent
            title={I18n.t("identification.unlockCode.reset.button_short")}
            subTitle={I18n.t("identification.unlockCode.reset.subtitle")}
            onPress={requestIdentificationAndResetPin}
          />
          {/* Enable/disable biometric authentication */}
          {isFingerprintAvailable && (
            <View style={styles.containerBiometricAuth}>
              <View style={styles.containerBiometricAuthTitle} accessible>
                <H3 numberOfLines={2}>
                  {I18n.t("profile.security.list.biometric_recognition.title")}
                </H3>
                <H4 numberOfLines={1} color="bluegrey" weight="Regular">
                  {I18n.t(
                    "profile.security.list.biometric_recognition.subtitle"
                  )}
                </H4>
              </View>
              <Switch
                value={isFingerprintEnabled}
                onValueChange={setBiometricPreference}
                style={styles.switch}
              />
            </View>
          )}
        </List>
      </Content>
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
