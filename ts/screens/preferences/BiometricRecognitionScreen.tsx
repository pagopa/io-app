import { connect } from "react-redux";
import * as React from "react";

import { NavigationInjectedProps } from "react-navigation";
import {
  Switch,
  View,
  NativeModules,
  Platform,
  Linking,
} from "react-native";
import { Button, Text } from "native-base";

import I18n from "../../i18n";

import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Markdown from "../../components/ui/Markdown";
import { setPreferenceFingerprintMaybeEnabledSuccess } from '../../store/actions/preferences';
import { getFingerprintSettings } from '../../sagas/startup/checkAcknowledgedFingerprintSaga';

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

  public componentDidMount() {
    getFingerprintSettings().then(biometryTypeOrUnsupportedReason => {
      this.setState({ isFingerprintAvailable: biometryTypeOrUnsupportedReason !== "UNAVAILABLE" && biometryTypeOrUnsupportedReason !== "NOT_ENROLLED" });
    });    
  }

  private onclickbtn = () => {
    // import { Linking, NativeModules, Platform, TouchableHighlight, Text, View, StyleSheet } from 'react-native';

    const { RNAndroidOpenSettings } = NativeModules;

  // openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL("app-settings:");
    } else {
      RNAndroidOpenSettings.appDetailsSettings();
    }

    /*
      Linking.canOpenURL('app-settings:').then(supported => {
        if (!supported) {
          console.log('Can\'t handle settings url');
        } else {
          return Linking.openURL('app-settings:');
        }
      }).catch(err => console.error('An error occurred', err));
    */
  };

  // openAppPrefs = () => {
  //   if (Platform.OS === 'ios') {
  //       Linking.openURL("App-prefs:root=General");
  //   } else {
  //       RNAndroidOpenSettings.generalSettings();
  //   }
  // }
  
  public render() {

    const { isFingerprintAvailable } = this.state;

    return (
      <TopScreenComponent
        title={I18n.t("biometric_recognition.title")}
        goBack={this.goBack}
        subtitle={I18n.t("biometric_recognition.subTitle")}
        contextualHelp={{
          title: I18n.t("biometric_recognition.title"),
          body: () => <Markdown>{I18n.t("biometric_recognition.help")}</Markdown>
        }}
      >
        { isFingerprintAvailable && <View

          // style={{
          //   width: "100%",
          //   flexDirection: "row",
          //   alignItems: "center",
          //   justifyContent: "space-between"
          // }}
          >
            <Text>{I18n.t("biometric_recognition.switchLabel")}</Text>
            <Switch
              value={this.props.isFingerprintEnabled}
              onValueChange={this.props.setFingerprintPreference}
              />
        </View>}
        { !isFingerprintAvailable && <View

          // style={{
          //   width: "100%",
          //   flexDirection: "row",
          //   alignItems: "center",
          //   justifyContent: "space-between"
          // }}
          >
          <Text>{I18n.t("biometric_recognition.enroll_cta")}</Text>
          <Button onPress={this.onclickbtn}>
            <Text>{I18n.t("biometric_recognition.enroll_btnLabel")}</Text>
          </Button>
        
          {/* <Button block={true}>
            <Text>
              Button for test pourposes
            </Text>
          </Button> */}
        </View>}
        {/* <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
          >
          <Text>{I18n.t("biometric_recognition.enroll_cta")}</Text>
          <Button onPress={this.onclickbtn}>
            <Text>
            {I18n.t("biometric_recognition.enroll_btnLabel")}
            </Text>
          </Button>
          <View>
            <Button block={true}>
              <Text>
                {I18n.t(true ? "messages.cta.paid" : "messages.cta.pay", {
                  amount: "0"})}
              </Text>
            </Button>
          </View>
        </View> */}
      
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isFingerprintEnabled: state.preferences.isFingerprintEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFingerprintPreference: (fingerprintPreference:boolean) => dispatch(
    setPreferenceFingerprintMaybeEnabledSuccess(fingerprintPreference)
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BiometricRecognitionScreen);
