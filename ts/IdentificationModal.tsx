import { Millisecond } from "italia-ts-commons/lib/units";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, Modal, StatusBar, StyleSheet } from "react-native";
import TouchID, { AuthenticationError } from "react-native-touch-id";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Pinpad from "./components/Pinpad";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "./components/screens/BaseScreenComponent";
import IconFont from "./components/ui/IconFont";
import TextWithIcon from "./components/ui/TextWithIcon";
import { isDebugBiometricIdentificationEnabled } from "./config";
import I18n from "./i18n";
import { getFingerprintSettings } from "./sagas/startup/checkAcknowledgedFingerprintSaga";
import { IdentificationLockModal } from "./screens/modal/IdentificationLockModal";
import { BiometryPrintableSimpleType } from "./screens/onboarding/FingerprintScreen";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationSuccess
} from "./store/actions/identification";
import {
  freeAttempts,
  identificationFailSelector,
  maxAttempts
} from "./store/reducers/identification";
import { GlobalState } from "./store/reducers/types";
import variables from "./theme/variables";
import customVariables from "./theme/variables";
import { authenticateConfig } from "./utils/biometric";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

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
  biometryAuthAvailable: boolean;
  canInsertPinTooManyAttempts: boolean;
  countdown?: Millisecond;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

const checkPinInterval = 100 as Millisecond;

// the threshold of attempts after which it is necessary to activate the timer check
const checkTimerThreshold = maxAttempts - freeAttempts;

const renderIdentificationByPinState = (
  identificationByPinState: IdentificationByPinState
) => {
  if (identificationByPinState === "failure") {
    return (
      <React.Fragment>
        <TextWithIcon danger={true}>
          <IconFont name="io-close" color={"white"} />
          <Text white={true}>
            {I18n.t("identification.unlockCode.confirmInvalid")}
          </Text>
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
  header: {
    fontSize: 20,
    lineHeight: 22
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
      biometryAuthAvailable: true,
      canInsertPinTooManyAttempts: this.props.identificationFailState.isNone()
    };
  }

  private idUpdateCanInsertPinTooManyAttempts?: number;

  /**
   * Update the state using the actual props value of the `identificationFailState`
   * return the updated value of `canInsertPinTooManyAttempts` in order to be used without waiting the state update
   */
  private updateCanInsertPinTooManyAttempts = () => {
    return this.props.identificationFailState.map(errorData => {
      const now = new Date();
      const canInsertPinTooManyAttempts = errorData.nextLegalAttempt <= now;
      this.setState({
        canInsertPinTooManyAttempts,
        countdown: (errorData.nextLegalAttempt.getTime() -
          now.getTime()) as Millisecond
      });
      return canInsertPinTooManyAttempts;
    });
  };

  /**
   * Activate the interval check on the pin state if the condition is satisfied
   * @param remainingAttempts
   */
  private scheduleCanInsertPinUpdate = () => {
    this.props.identificationFailState.map(failState => {
      if (failState.remainingAttempts < checkTimerThreshold) {
        this.updateCanInsertPinTooManyAttempts();
        // tslint:disable-next-line: no-object-mutation
        this.idUpdateCanInsertPinTooManyAttempts = setInterval(
          this.updateCanInsertPinTooManyAttempts,
          checkPinInterval
        );
      }
    });
  };

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
      this.setState({ biometryAuthAvailable: false });
    }

    // first time the component is mounted, need to calculate the state value for `canInsertPinTooManyAttempts`
    // and schedule the update if needed
    this.updateCanInsertPinTooManyAttempts().map(_ =>
      this.scheduleCanInsertPinUpdate()
    );
  }

  // atm this method is never called because the component won't be never unmount
  public componentWillUnmount() {
    clearInterval(this.idUpdateCanInsertPinTooManyAttempts);
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
    const { identificationProgressState, isFingerprintEnabled } = this.props;

    if (identificationProgressState.kind !== "started") {
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
                biometryAuthAvailable:
                  biometryType !== "NOT_ENROLLED" &&
                  biometryType !== "UNAVAILABLE"
              });
            }
          },
          _ => undefined
        )
        .then(
          () => {
            if (this.state.biometryType) {
              this.onFingerprintRequest(this.onIdentificationSuccessHandler);
            }
          },
          _ => undefined
        );
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    // When app becomes active from background the state of TouchID support
    // must be updated, because it might be switched off.
    // Don't do this check if I can't authenticate for too many attempts (canInsertPinTooManyAttempts === false)
    if (
      this.state.canInsertPinTooManyAttempts &&
      ((prevProps.appState === "background" &&
        this.props.appState === "active") ||
        (prevProps.identificationProgressState.kind !== "started" &&
          this.props.identificationProgressState.kind === "started"))
    ) {
      this.maybeTriggerFingerprintRequest({
        updateBiometrySupportProp:
          prevProps.appState !== "active" && this.props.appState === "active"
      });
    }

    const previousAttempts = prevProps.identificationFailState.fold(
      Number.MAX_VALUE,
      x => x.remainingAttempts
    );

    const currentAttempts = this.props.identificationFailState.fold(
      Number.MAX_VALUE,
      x => x.remainingAttempts
    );

    // trigger an update in the management of the updateInterval if the attempts or the state
    // `canInsertPinTooManyAttempts` is changed
    if (
      previousAttempts !== currentAttempts ||
      prevState.canInsertPinTooManyAttempts !==
        this.state.canInsertPinTooManyAttempts
    ) {
      // trigger a state update based on the current props and use the results to choose what to do
      // with the scheduled interval
      const caninsertPin = this.updateCanInsertPinTooManyAttempts().getOrElse(
        true
      );
      // if the pin can be inserted, the timer is no longer needed
      if (caninsertPin) {
        clearInterval(this.idUpdateCanInsertPinTooManyAttempts);
        // tslint:disable-next-line: no-object-mutation
        this.idUpdateCanInsertPinTooManyAttempts = undefined;

        // if the pin can't be inserted and is not scheduled an interval, schedule an update
      } else if (this.idUpdateCanInsertPinTooManyAttempts === undefined) {
        this.scheduleCanInsertPinUpdate();
      }
    }
  }

  private onIdentificationSuccessHandler = () => {
    const { identificationProgressState } = this.props;

    if (identificationProgressState.kind !== "started") {
      return;
    }

    // The identification state is started we need to show the modal
    const { identificationSuccessData } = identificationProgressState;

    if (identificationSuccessData) {
      identificationSuccessData.onSuccess();
    }
    this.props.onIdentificationSuccess();
  };

  private onIdentificationFailureHandler = () => {
    const { identificationFailState } = this.props;

    const forceLogout = identificationFailState
      .map(failState => failState.remainingAttempts === 1)
      .getOrElse(false);
    if (forceLogout) {
      this.props.onIdentificationForceLogout();
    } else {
      this.props.onIdentificationFailure();
    }
  };

  public render() {
    const { identificationProgressState, isFingerprintEnabled } = this.props;

    if (identificationProgressState.kind !== "started") {
      return null;
    }

    // The identification state is started we need to show the modal
    const {
      pin,
      canResetPin,
      isValidatingTask,
      identificationCancelData,
      shufflePad
    } = identificationProgressState;

    const {
      identificationByPinState,
      identificationByBiometryState,
      biometryType,
      countdown
    } = this.state;

    const canInsertPin =
      !this.state.biometryAuthAvailable &&
      this.state.canInsertPinTooManyAttempts;

    // display the remaining attempts number only if start to lock the application for too many attempts
    const displayRemainingAttempts = this.props.identificationFailState.fold(
      undefined,
      failState =>
        failState.remainingAttempts <= maxAttempts - freeAttempts
          ? failState.remainingAttempts
          : undefined
    );

    /**
     * Create handlers merging default internal actions (to manage the identification state)
     * with, if available, custom actions passed as props.
     */
    const onIdentificationCancelHandler = () => {
      if (identificationCancelData) {
        identificationCancelData.onCancel();
      }
      this.props.onCancelIdentification();
    };

    const renderHeader = () => {
      return (
        <React.Fragment>
          <Text
            bold={true}
            alignCenter={true}
            style={styles.header}
            white={!isValidatingTask}
            dark={isValidatingTask}
          >
            {I18n.t(
              isValidatingTask
                ? "identification.titleValidation"
                : "identification.title"
            )}
          </Text>
          <Text
            alignCenter={true}
            white={!isValidatingTask}
            dark={isValidatingTask}
          >
            {this.getInstructions()}
          </Text>
        </React.Fragment>
      );
    };

    const defaultColor = isValidatingTask
      ? customVariables.contentPrimaryBackground
      : customVariables.colorWhite;

    return !this.state.canInsertPinTooManyAttempts ? (
      IdentificationLockModal({ countdown })
    ) : (
      <Modal onRequestClose={onRequestCloseHandler}>
        <BaseScreenComponent
          primary={!isValidatingTask}
          contextualHelpMarkdown={contextualHelpMarkdown}
          faqCategories={["unlock", "onboarding_pin", "onboarding_fingerprint"]}
          appLogo={true}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor={variables.contentPrimaryBackground}
          />
          <Content primary={!isValidatingTask}>
            {renderHeader()}

            <Pinpad
              onPinResetHandler={
                canResetPin ? this.props.onPinResetHandler : undefined
              }
              isFingerprintEnabled={isFingerprintEnabled}
              biometryType={biometryType}
              onFingerPrintReq={() =>
                this.onFingerprintRequest(this.onIdentificationSuccessHandler)
              }
              shufflePad={shufflePad}
              disabled={!canInsertPin}
              compareWithCode={pin as string}
              activeColor={defaultColor}
              inactiveColor={defaultColor}
              buttonType={isValidatingTask ? "light" : "primary"}
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
              remainingAttempts={displayRemainingAttempts}
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
   * Return the proper instruction based on the avaiable identification method
   * @param biometrySimplePrintableType
   */
  private getInstructions(): string {
    switch (this.state.biometryType) {
      case "FINGERPRINT":
        return I18n.t("identification.subtitleCodeFingerprint");
      case "FACE_ID":
        return I18n.t("identification.subtitleCodeFaceId");
      case "TOUCH_ID":
        return I18n.t("identification.subtitleCodeFingerprint");
      default:
        return I18n.t("identification.subtitleCode");
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
    onIdentificationSuccessHandler: () => void
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
          biometryAuthAvailable: false
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
      });
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onPinResetHandler: () => dispatch(identificationPinReset()),
  onCancelIdentification: () => dispatch(identificationCancel()),
  onIdentificationSuccess: () => dispatch(identificationSuccess()),
  onIdentificationForceLogout: () => dispatch(identificationForceLogout()),
  onIdentificationFailure: () => dispatch(identificationFailure())
});

const mapStateToProps = (state: GlobalState) => ({
  identificationProgressState: state.identification.progress,
  identificationFailState: identificationFailSelector(state),
  isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled,
  appState: state.appState.appState
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IdentificationModal);
