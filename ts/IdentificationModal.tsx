import { Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, Modal, StyleSheet } from "react-native";
import TouchID, { AuthenticationError } from "react-native-touch-id";
import { connect } from "react-redux";
import Pinpad from "./components/Pinpad";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "./components/screens/BaseScreenComponent";
import IconFont from "./components/ui/IconFont";
import TextWithIcon from "./components/ui/TextWithIcon";
import { isDebugBiometricIdentificationEnabled } from "./config";
import I18n from "./i18n";
import { getFingerprintSettings } from "./sagas/startup/checkAcknowledgedFingerprintSaga";
import { BiometryPrintableSimpleType } from "./screens/onboarding/FingerprintScreen";
import {
  identificationCancel,
  identificationFailure,
  identificationPinReset,
  identificationSuccess
} from "./store/actions/identification";
import { ReduxProps } from "./store/actions/types";
import { GlobalState } from "./store/reducers/types";
import variables from "./theme/variables";
import { authenticateConfig } from "./utils/biometric";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

/**
 * Type used in the local state to save the result of Pinpad code matching.
 * State is "unstarted" if the user still need to insert the unlock code.
 * State is "failure" when the unlock code inserted by the user do not match the
 * stored one.
 */
type IdentificationByPinState = "unstarted" | "failure";

type IdentificationByBiometryState = "unstarted" | "failure";

type State = {
  identificationByPinState: IdentificationByPinState;
  identificationByBiometryState: IdentificationByBiometryState;
  biometryType?: BiometryPrintableSimpleType;
  canInsertPin: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.pin.contextualHelpTitle",
  body: "onboarding.pin.contextualHelpContent"
};

const renderIdentificationByPinState = (
  identificationByPinState: IdentificationByPinState
) => {
  if (identificationByPinState === "failure") {
    return (
      <React.Fragment>
        <TextWithIcon danger={true}>
          <IconFont name="io-close" color={"white"} />
          <Text white={true}>{I18n.t("pin_login.pin.confirmInvalid")}</Text>
        </TextWithIcon>
      </React.Fragment>
    );
  }

  return null;
};

const renderIdentificationByBiometryState = (
  identificationByBiometryState: IdentificationByPinState
) => {
  if (identificationByBiometryState === "failure") {
    return (
      <React.Fragment>
        <View spacer={true} extralarge={true} />
        <TextWithIcon danger={true}>
          <IconFont name="io-close" color={"white"} />
          <Text white={true}>{I18n.t("identification.biometric.failure")}</Text>
        </TextWithIcon>
      </React.Fragment>
    );
  }

  return null;
};

const onRequestCloseHandler = () => undefined;

const styles = StyleSheet.create({
  identificationMessage: {
    alignSelf: "center",
    color: variables.colorWhite,
    fontSize: 16,
    lineHeight: 20,
    width: "100%"
  },
  resetPinMessage: {
    alignSelf: "center",
    color: variables.colorWhite,
    fontSize: 14,
    lineHeight: 18,
    width: "80%"
  },
  pinPad: {
    justifyContent: "center",
    flexGrow: 1
  }
});

/**
 * A component used to identify the the user.
 * The identification process can be activated calling a saga or dispatching the
 * identificationRequest redux action.
 */
class IdentificationModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      identificationByPinState: "unstarted",
      identificationByBiometryState: "unstarted",
      canInsertPin: false
    };
  }

  public componentDidMount() {
    const { isFingerprintEnabled } = this.props;
    if (isFingerprintEnabled) {
      getFingerprintSettings().then(
        biometryType =>
          this.setState({
            biometryType:
              biometryType !== "NOT_ENROLLED" && biometryType !== "UNAVAILABLE"
                ? biometryType
                : undefined
          }),
        _ => 0
      );
    } else {
      // if the biometric is not available unlock the unlock code insertion
      this.setState({ canInsertPin: true });
    }
  }

  /**
   * Check if fingerprint login can be prompted by looking at three parameters in
   * serie:
   * 1. The current state of identification process
   * 2. `isFingerprintEnabled` whose value comes from app preferences
   * 3. Current status of biometry recognition system, provided by querying
   * the library in charge.
   *
   * @param {boolean} updateBiometrySupportProp – This flag is needed because
   * this funciton can be run from several contexts: when it is called while
   * the app is returning foreground from background, biometry support status
   * has to be updated in case of system preferences changes.
   */
  private maybeTriggerFingerprintRequest(updateBiometrySupportProp?: {
    updateBiometrySupportProp: boolean;
  }) {
    // check if the state of identification process is correct
    const { identificationState, isFingerprintEnabled } = this.props;

    if (identificationState.kind !== "started") {
      return;
    }

    // Check for global properties to know if biometric recognition is enabled
    if (isFingerprintEnabled) {
      getFingerprintSettings()
        .then(
          biometryType => {
            if (updateBiometrySupportProp) {
              this.setState({
                biometryType:
                  biometryType !== "NOT_ENROLLED" &&
                  biometryType !== "UNAVAILABLE"
                    ? biometryType
                    : undefined,
                canInsertPin:
                  biometryType === "NOT_ENROLLED" ||
                  biometryType === "UNAVAILABLE"
              });
            }
          },
          _ => undefined
        )
        .then(
          () => {
            if (this.state.biometryType) {
              this.onFingerprintRequest(
                this.onIdentificationSuccessHandler,
                this.onIdentificationFailureHandler
              );
            }
          },
          _ => undefined
        );
    }
  }

  public componentDidUpdate(prevProps: Props) {
    // When app becomes active from background the state of TouchID support
    // must be updated, because it might be switched off.
    if (
      (prevProps.appState === "background" &&
        this.props.appState === "active") ||
      (prevProps.identificationState.kind !== "started" &&
        this.props.identificationState.kind === "started")
    ) {
      this.maybeTriggerFingerprintRequest({
        updateBiometrySupportProp:
          prevProps.appState !== "active" && this.props.appState === "active"
      });
    }
  }

  private onIdentificationSuccessHandler = () => {
    const { identificationState, dispatch } = this.props;

    if (identificationState.kind !== "started") {
      return;
    }

    // The identification state is started we need to show the modal
    const { identificationSuccessData } = identificationState;

    if (identificationSuccessData) {
      identificationSuccessData.onSuccess();
    }
    dispatch(identificationSuccess());
  };

  private onIdentificationFailureHandler = () => {
    const { dispatch } = this.props;
    dispatch(identificationFailure());
  };

  public render() {
    const { identificationState, isFingerprintEnabled, dispatch } = this.props;

    if (identificationState.kind !== "started") {
      return null;
    }

    // The identification state is started we need to show the modal
    const {
      pin,
      canResetPin,
      identificationGenericData,
      identificationCancelData,
      shufflePad
    } = identificationState;

    const {
      identificationByPinState,
      identificationByBiometryState,
      biometryType
    } = this.state;

    const identificationMessage = identificationGenericData
      ? identificationGenericData.message
      : this.renderBiometryType();

    /**
     * Create handlers merging default internal actions (to manage the identification state)
     * with, if available, custom actions passed as props.
     */
    const onIdentificationCancelHandler = () => {
      if (identificationCancelData) {
        identificationCancelData.onCancel();
      }
      dispatch(identificationCancel());
    };

    const onPinResetHandler = () => {
      dispatch(identificationPinReset());
    };

    return (
      <Modal onRequestClose={onRequestCloseHandler} transparent={true}>
        <BaseScreenComponent
          primary={true}
          contextualHelpMarkdown={contextualHelpMarkdown}
          faqCategories={["unlock", "onboarding_pin", "onboarding_fingerprint"]}
          appLogo={true}
          withSafeArea={true}
        >
          <Content primary={true} contentContainerStyle={styles.pinPad}>
            <Text
              bold={true}
              alignCenter={true}
              style={styles.identificationMessage}
            >
              {identificationMessage}
            </Text>
            <Pinpad
              onPinResetHandler={canResetPin ? onPinResetHandler : undefined}
              isFingerprintEnabled={isFingerprintEnabled}
              biometryType={biometryType}
              onFingerPrintReq={() =>
                this.onFingerprintRequest(
                  this.onIdentificationSuccessHandler,
                  this.onIdentificationFailureHandler
                )
              }
              shufflePad={shufflePad}
              disabled={!this.state.canInsertPin}
              compareWithCode={pin as string}
              activeColor={"white"}
              inactiveColor={"white"}
              buttonType="primary"
              delayOnFailureMillis={1000}
              onFulfill={(_: string, __: boolean) =>
                this.onPinFullfill(
                  _,
                  __,
                  this.onIdentificationSuccessHandler,
                  this.onIdentificationFailureHandler
                )
              }
              clearOnInvalid={true}
              onCancel={
                identificationCancelData
                  ? onIdentificationCancelHandler
                  : undefined
              }
            />
            {renderIdentificationByPinState(identificationByPinState)}
            {renderIdentificationByBiometryState(identificationByBiometryState)}

            <View spacer={true} large={true} />
          </Content>
        </BaseScreenComponent>
      </Modal>
    );
  }

  /**
   * Print the only BiometrySimplePrintableType values that are passed to the UI
   * @param biometrySimplePrintableType
   */
  private renderBiometryType(): string {
    switch (this.state.biometryType) {
      case "FINGERPRINT":
        return I18n.t("identification.messageFingerPrint");
      case "FACE_ID":
        return I18n.t("identification.messageFaceID");
      case "TOUCH_ID":
        return I18n.t("identification.messageFingerPrint");
      default:
        return I18n.t("identification.messageEnterPin");
    }
  }

  private onPinFullfill = (
    _: string,
    isValid: boolean,
    onIdentificationSuccessHandler: () => void,
    onIdentificationFailureHandler: () => void
  ) => {
    if (isValid) {
      this.setState({
        identificationByPinState: "unstarted"
      });
      onIdentificationSuccessHandler();
    } else {
      this.setState({
        identificationByPinState: "failure"
      });

      onIdentificationFailureHandler();
    }
  };

  private onFingerprintRequest = (
    onIdentificationSuccessHandler: () => void,
    onIdentificationFailureHandler: () => void
  ) => {
    TouchID.authenticate(
      I18n.t("identification.biometric.popup.reason"),
      authenticateConfig
    )
      .then(() => {
        this.setState({
          identificationByBiometryState: "unstarted"
        });
        onIdentificationSuccessHandler();
      })
      .catch((error: AuthenticationError) => {
        // some error occured, enable pin insertion
        this.setState({
          canInsertPin: true
        });
        if (isDebugBiometricIdentificationEnabled) {
          Alert.alert("identification.biometric.title", `KO: ${error.code}`);
        }
        if (
          error.code !== "USER_CANCELED" &&
          error.code !== "SYSTEM_CANCELED"
        ) {
          this.setState({
            identificationByBiometryState: "failure"
          });
        }
        onIdentificationFailureHandler();
      });
  };
}

const mapStateToProps = (state: GlobalState) => ({
  identificationState: state.identification,
  isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled,
  appState: state.appState.appState
});

export default connect(mapStateToProps)(IdentificationModal);
