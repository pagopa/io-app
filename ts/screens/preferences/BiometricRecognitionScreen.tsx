import { Button, Text } from "native-base";
import * as React from "react";
import { Switch, View } from "react-native";
import TouchID, { AuthenticationError } from "react-native-touch-id";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import { authenticateConfig } from "../../utils/biometric";
import { showToast } from "../../utils/showToast";

import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import { openAppSecuritySettings } from "../../utils/appSettings";

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  OwnProps;

type State = {
  isFingerprintAvailable: boolean;
};

const INITIAL_STATE: State = {
  isFingerprintAvailable: true
};

/**
 * Implements the biometric recognition preference screen where the user can
 * opt for explicitly not using fingerprint. This class shows up two possible
 * scenarios:
 * * a switch to enable/disable biometric recognition. Enabled if the
 *   fingerprint is enrolled.
 * * the above switch (disabled) with a button below that redirects the user to
 *   device settings otherwise.
 *
 * Please note that this screen must not be displayed if biometric recognition
 * is unavailable.
 */
class BiometricRecognitionScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private goBack = () => this.props.navigation.goBack();

  public componentWillMount() {
    getFingerprintSettings().then(
      biometryTypeOrUnsupportedReason => {
        this.setState({
          isFingerprintAvailable:
            biometryTypeOrUnsupportedReason !== "UNAVAILABLE" &&
            biometryTypeOrUnsupportedReason !== "NOT_ENROLLED"
        });
      },
      _ => undefined
    );
  }

  private setBiometricPreference = (biometricPreference: boolean): void => {
    if (biometricPreference) {
      // if user asks to enable biometric then call enable action directly
      this.props.setFingerprintPreference(biometricPreference);
      return;
    }
    // if user asks to disable biometric recnognition is required to proceed
    TouchID.authenticate(
      I18n.t("identification.biometric.popup.reason"),
      authenticateConfig
    )
      .then(() => this.props.setFingerprintPreference(biometricPreference))
      .catch((_: AuthenticationError) =>
        // this toast will be show either if recognition fails (mismatch or user aborts)
        // or if meanwhile user disables biometric recognition in OS settings
        showToast(I18n.t("biometric_recognition.needed_to_disable"), "danger")
      );
  };

  public render() {
    const { isFingerprintAvailable } = this.state;

    return (
      <TopScreenComponent
        title={I18n.t("biometric_recognition.title")}
        goBack={this.goBack}
        contextualHelp={{
          title: I18n.t("biometric_recognition.title"),
          body: () => (
            <Markdown>{I18n.t("biometric_recognition.help")}</Markdown>
          )
        }}
      >
        <ScreenContentHeader
          title={I18n.t("biometric_recognition.title")}
          subtitle={I18n.t("biometric_recognition.subTitle")}
        />
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 25
          }}
        >
          <Text>{I18n.t("biometric_recognition.switchLabel")}</Text>
          <Switch
            value={this.props.isFingerprintEnabled}
            onValueChange={this.setBiometricPreference}
            disabled={!isFingerprintAvailable}
          />
        </View>
        {!isFingerprintAvailable && (
          <View
            style={{
              padding: 25
            }}
          >
            <Text
              style={{
                marginBottom: 25
              }}
            >
              {I18n.t("biometric_recognition.enroll_cta")}
            </Text>
            <Button onPress={openAppSecuritySettings}>
              <Text>{I18n.t("biometric_recognition.enroll_btnLabel")}</Text>
            </Button>
          </View>
        )}
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFingerprintPreference: (fingerprintPreference: boolean) =>
    dispatch(
      preferenceFingerprintIsEnabledSaveSuccess({
        isFingerprintEnabled: fingerprintPreference
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BiometricRecognitionScreen);
