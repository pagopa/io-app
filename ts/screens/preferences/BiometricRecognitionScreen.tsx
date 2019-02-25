import * as React from "react";
import { connect } from "react-redux";

import { NavigationInjectedProps } from "react-navigation";

import { Linking, Platform, Switch, View } from "react-native";

import { Button, Text } from "native-base";

import AndroidOpenSettings from "react-native-android-open-settings";
import I18n from "../../i18n";

import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Markdown from "../../components/ui/Markdown";
import { getFingerprintSettings } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import { preferenceFingerprintIsEnabledSave } from "../../store/actions/preferences";

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

  private openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("App-prefs:root=General").catch(_ => undefined);
    } else {
      AndroidOpenSettings.securitySettings();
    }
  };

  public render() {
    const { isFingerprintAvailable } = this.state;

    return (
      <TopScreenComponent
        title={I18n.t("biometric_recognition.title")}
        goBack={this.goBack}
        subtitle={I18n.t("biometric_recognition.subTitle")}
        contextualHelp={{
          title: I18n.t("biometric_recognition.title"),
          body: () => (
            <Markdown>{I18n.t("biometric_recognition.help")}</Markdown>
          )
        }}
      >
        {isFingerprintAvailable && (
          <View
            style={{
              width: "100%",
            }}
          >
            <Text>{I18n.t("biometric_recognition.switchLabel")}</Text>
            <Switch
              value={this.props.isFingerprintEnabled}
              onValueChange={this.props.setFingerprintPreference}
            />
          </View>
        )}
        {!isFingerprintAvailable && (
          <View
            style={{
              width: "100%",
            }}
          >
            <Text>{I18n.t("biometric_recognition.enroll_cta")}</Text>
            <Button onPress={this.openAppSettings}>
              <Text>{I18n.t("biometric_recognition.enroll_btnLabel")}</Text>
            </Button>
          </View>
        )}
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isFingerprintEnabled: state.preferences.isFingerprintEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFingerprintPreference: (fingerprintPreference: boolean) =>
    dispatch(preferenceFingerprintIsEnabledSave(fingerprintPreference))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BiometricRecognitionScreen);
