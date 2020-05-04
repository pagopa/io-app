import { Text } from "native-base";
import * as React from "react";
import { View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Switch from "../../components/ui/Switch";
import I18n from "../../i18n";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../store/actions/persistedPreferences";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import { openAppSecuritySettings } from "../../utils/appSettings";
import {
  fingerprintAuth,
  getFingerprintSettings,
  unmountBiometricAuth
} from "../../utils/fingerprint";
import { showToast } from "../../utils/showToast";

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

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "biometric_recognition.contextualHelpTitle",
  body: "biometric_recognition.contextualHelpContent"
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

  public componentDidMount() {
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

  public componentWillUnmount() {
    unmountBiometricAuth();
  }

  private setBiometricPreference = (biometricPreference: boolean): void => {
    fingerprintAuth()
      .then(res => {
        if (res === true) {
          this.props.setFingerprintPreference(biometricPreference);
        }
      })
      .catch(_ => {
        // this toast will be show either if recognition fails (mismatch or user aborts)
        // or if meanwhile user disables biometric recognition in OS settings
        showToast(I18n.t("biometric_recognition.needed_to_disable"), "danger");
      });
  };

  public render() {
    const { isFingerprintAvailable } = this.state;

    return (
      <TopScreenComponent
        headerTitle={I18n.t("biometric_recognition.title")}
        goBack={this.goBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["onboarding_fingerprint"]}
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
            <ButtonDefaultOpacity onPress={openAppSecuritySettings}>
              <Text>{I18n.t("biometric_recognition.enroll_btnLabel")}</Text>
            </ButtonDefaultOpacity>
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
