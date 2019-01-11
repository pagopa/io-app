import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, Modal, StatusBar, StyleSheet } from "react-native";
import TouchID, {
  AuthenticateConfig,
  AuthenticationError,
  IsSupportedConfig
} from "react-native-touch-id";
import { connect } from "react-redux";

import Pinpad from "./components/Pinpad";
import BaseScreenComponent from "./components/screens/BaseScreenComponent";
import IconFont from "./components/ui/IconFont";
import Markdown from "./components/ui/Markdown";
import TextWithIcon from "./components/ui/TextWithIcon";
import { isDebugBiometricIdentificationEnabled } from "./config";
import I18n from "./i18n";
import {
  identificationCancel,
  identificationFailure,
  identificationPinReset,
  identificationSuccess
} from "./store/actions/identification";
import { ReduxProps } from "./store/actions/types";
import { IdentificationState } from "./store/reducers/identification";
import { GlobalState } from "./store/reducers/types";
import variables from "./theme/variables";

type ReduxMappedStateProps = {
  identificationState: IdentificationState;
};

type Props = ReduxMappedStateProps & ReduxProps;

/**
 * Type used in the local state to save the result of Pinpad PIN matching.
 * State is "unstarted" if the user still need to insert the PIN.
 * State is "failure" when the PIN inserted by the user do not match the
 * stored one.
 */
type IdentificationByPinState = "unstarted" | "failure";

type IdentificationByBiometryState = "unstarted" | "failure";

type State = {
  identificationByPinState: IdentificationByPinState;
  identificationByBiometryState: IdentificationByBiometryState;
  biometryType?: string;
};

const contextualHelp = {
  title: I18n.t("pin_login.unlock_screen.help.title"),
  body: () => (
    <Markdown lazyOptions={{ lazy: true }}>
      {I18n.t("pin_login.unlock_screen.help.content")}
    </Markdown>
  )
};

const renderIdentificationByPinState = (
  identificationByPinState: IdentificationByPinState
) => {
  if (identificationByPinState === "failure") {
    return (
      <React.Fragment>
        <View spacer={true} extralarge={true} />
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

const isSupportedConfig: IsSupportedConfig = {
  unifiedErrors: true
};

const authenticateConfig: AuthenticateConfig = {
  unifiedErrors: true
};

const styles = StyleSheet.create({
  identificationMessage: {
    alignSelf: "center",
    color: variables.colorWhite,
    fontSize: 16,
    lineHeight: 21,
    width: "70%"
  },
  resetPinMessage: {
    alignSelf: "center",
    color: variables.colorWhite,
    fontSize: 14,
    lineHeight: 18,
    width: "80%"
  }
});

/**
 * A component used to identify the the user.
 * The identification process can be activated calling a saga or dispatching the
 * requestIdentification redux action.
 */
class IdentificationModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      identificationByPinState: "unstarted",
      identificationByBiometryState: "unstarted"
    };
  }

  public componentWillMount() {
    TouchID.isSupported(isSupportedConfig)
      .then(biometryType => {
        // On Android it just return `true`
        if (biometryType === true) {
          this.setState({ biometryType: "Fingerprint" });
        } else {
          this.setState({ biometryType });
        }
      })
      .catch(() => {
        this.setState({ biometryType: undefined });
      });
  }

  public render() {
    const { identificationState, dispatch } = this.props;

    if (identificationState.kind !== "started") {
      return null;
    }

    // The identification state is started we need to show the modal
    const {
      pin,
      identificationGenericData,
      identificationCancelData,
      identificationSuccessData
    } = identificationState;

    const {
      identificationByPinState,
      identificationByBiometryState,
      biometryType
    } = this.state;

    const identificationMessage = identificationGenericData
      ? identificationGenericData.message
      : I18n.t("identification.message");

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

    const onIdentificationSuccessHandler = () => {
      if (identificationSuccessData) {
        identificationSuccessData.onSuccess();
      }
      dispatch(identificationSuccess());
    };

    const onIdentificationFailureHandler = () => {
      dispatch(identificationFailure());
    };

    const onPinResetHandler = () => {
      dispatch(identificationPinReset());
    };

    return (
      <Modal onRequestClose={onRequestCloseHandler}>
        <BaseScreenComponent primary={true} contextualHelp={contextualHelp}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={variables.contentPrimaryBackground}
          />
          <Content primary={true}>
            {biometryType && (
              <React.Fragment>
                <Button
                  block={true}
                  primary={true}
                  onPress={() =>
                    this.onFingerprintRequest(
                      onIdentificationSuccessHandler,
                      onIdentificationFailureHandler
                    )
                  }
                >
                  <Text>{biometryType}</Text>
                </Button>
                <View spacer={true} />
              </React.Fragment>
            )}
            <View spacer={true} />
            <Text
              bold={true}
              alignCenter={true}
              style={styles.identificationMessage}
            >
              {identificationMessage}
            </Text>
            <Pinpad
              compareWithCode={pin as string}
              activeColor={"white"}
              inactiveColor={"white"}
              buttonType="primary"
              onFulfill={(_: string, __: boolean) =>
                this.onPinFullfill(
                  _,
                  __,
                  onIdentificationSuccessHandler,
                  onIdentificationFailureHandler
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

            {identificationCancelData === undefined && (
              <React.Fragment>
                <Button block={true} primary={true} onPress={onPinResetHandler}>
                  <Text>{I18n.t("pin_login.pin.reset.button")}</Text>
                </Button>
                <View spacer={true} large={true} />
              </React.Fragment>
            )}

            <Text alignCenter={true} style={styles.resetPinMessage}>
              {identificationCancelData !== undefined
                ? I18n.t("identification.resetPinFromProfileMessage")
                : I18n.t("identification.resetPinMessage")}
            </Text>

            <View spacer={true} extralarge={true} />
          </Content>
        </BaseScreenComponent>
      </Modal>
    );
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
    TouchID.authenticate("Identification", authenticateConfig)
      .then(() => {
        this.setState({
          identificationByBiometryState: "unstarted"
        });
        onIdentificationSuccessHandler();
      })
      .catch((error: AuthenticationError) => {
        if (isDebugBiometricIdentificationEnabled) {
          Alert.alert("Biometric identification", `KO: ${error.code}`);
        }
        if (error.code !== "USER_CANCELED") {
          this.setState({
            identificationByBiometryState: "failure"
          });
        }
        onIdentificationFailureHandler();
      });
  };
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  identificationState: state.identification
});

export default connect(mapStateToProps)(IdentificationModal);
