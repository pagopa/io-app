import { fromNullable } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, Modal, StatusBar, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Link } from "../../components/core/typography/Link";
import Pinpad from "../../components/Pinpad";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { IdentificationLockModal } from "../../screens/modal/IdentificationLockModal";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationSuccess
} from "../../store/actions/identification";
import { appCurrentStateSelector } from "../../store/reducers/appState";
import {
  freeAttempts,
  IdentificationCancelData,
  identificationFailSelector,
  maxAttempts,
  progressSelector
} from "../../store/reducers/identification";
import { profileNameSelector } from "../../store/reducers/profile";
import { isFingerprintEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { setAccessibilityFocus } from "../../utils/accessibility";
import {
  biometricAuthenticationRequest,
  BiometricsValidType,
  getBiometricsType,
  isBiometricsValidType
} from "../../utils/biometrics";
import { maybeNotNullyString } from "../../utils/strings";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { assistanceToolRemoteConfig } from "../../utils/supportAssistance";
import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";

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
  biometryType?: BiometricsValidType;
  biometryAuthAvailable: boolean;
  canInsertPinTooManyAttempts: boolean;
  countdown?: Millisecond;
  errorDescription?: string;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

const checkPinInterval = 100 as Millisecond;

// the threshold of attempts after which it is necessary to activate the timer check
const checkTimerThreshold = maxAttempts - freeAttempts;

const onRequestCloseHandler = () => undefined;

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    lineHeight: 22
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center"
  },
  contentContainerStyle: {
    flexGrow: 1,
    padding: customVariables.contentPadding
  }
});

/**
 * A component used to identify the the user.
 * The identification process can be activated calling a saga or dispatching the
 * identificationRequest redux action.
 * The modal can have 2 designs:
 * 1. primary background: used to autenticate the user when he/she enters the app
 * 2. white background: used to identify the user when he/she wants to complete a task (eg a payment)
 * The 2nd design is displayed when isValidatingTask (from the identificationProgressState) is true
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

  private headerRef = React.createRef<Text>();
  private errorStatusRef = React.createRef<Text>();

  private idUpdateCanInsertPinTooManyAttempts?: number;

  /**
   * Update the state using the actual props value of the `identificationFailState`
   * return the updated value of `canInsertPinTooManyAttempts` in order to be used without waiting the state update
   */
  private updateCanInsertPinTooManyAttempts = () =>
    this.props.identificationFailState.map(errorData => {
      const now = new Date();
      const canInsertPinTooManyAttempts = errorData.nextLegalAttempt <= now;
      this.setState({
        canInsertPinTooManyAttempts,
        countdown: (errorData.nextLegalAttempt.getTime() -
          now.getTime()) as Millisecond
      });
      return canInsertPinTooManyAttempts;
    });

  /**
   * Activate the interval check on the pin state if the condition is satisfied
   */
  private scheduleCanInsertPinUpdate = () => {
    this.props.identificationFailState.map(failState => {
      if (failState.remainingAttempts < checkTimerThreshold) {
        this.updateCanInsertPinTooManyAttempts();
        // eslint-disable-next-line
        this.idUpdateCanInsertPinTooManyAttempts = setInterval(
          this.updateCanInsertPinTooManyAttempts,
          checkPinInterval
        );
      }
    });
  };

  public componentDidMount() {
    const { isFingerprintEnabled } = this.props;
    setAccessibilityFocus(this.headerRef);
    if (isFingerprintEnabled) {
      getBiometricsType().then(
        biometricsType =>
          this.setState({
            biometryType: isBiometricsValidType(biometricsType)
              ? biometricsType
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
      getBiometricsType()
        .then(
          biometricsType => {
            if (updateBiometrySupportProp) {
              this.setState({
                biometryType: isBiometricsValidType(biometricsType)
                  ? biometricsType
                  : undefined,
                biometryAuthAvailable: isBiometricsValidType(biometricsType)
              });
            }
          },
          _ => undefined
        )
        .then(
          () => {
            if (this.state.biometryType) {
              void this.onFingerprintRequest(
                this.onIdentificationSuccessHandler
              );
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
      setAccessibilityFocus(this.headerRef);
    }

    // Added to solve the issue https://www.pivotaltracker.com/story/show/173217033
    if (prevProps.isFingerprintEnabled !== this.props.isFingerprintEnabled) {
      this.setState({
        biometryAuthAvailable: fromNullable(
          this.props.isFingerprintEnabled
        ).getOrElse(false)
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
      const caninsertPin =
        this.updateCanInsertPinTooManyAttempts().getOrElse(true);
      // if the pin can be inserted, the timer is no longer needed
      if (caninsertPin) {
        clearInterval(this.idUpdateCanInsertPinTooManyAttempts);
        // eslint-disable-next-line
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

  private loadAlertTexts = (
    profileName: string | undefined
  ): [string, string] =>
    fromNullable(profileName).fold(
      [
        I18n.t("identification.logout"),
        I18n.t("identification.logoutDescription")
      ],
      pn => [
        I18n.t("identification.logoutProfileName", {
          profileName: pn
        }),
        I18n.t("identification.logoutDescriptionProfileName", {
          profileName: pn
        })
      ]
    );

  private onLogout = () => {
    Alert.alert(
      ...this.loadAlertTexts(this.props.profileName),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.continue"),
          onPress: this.props.onIdentificationForceLogout
        }
      ],
      { cancelable: true }
    );
  };

  // The generic "Try again" message appears if you make a mistake
  // in entering the unlock code or in case of failed biometric authentication.
  // If you fail to write the unlock code more than 4 times you should see
  // "Try again. Number of remaining attempts". In case of failed biometric identification
  // the message is displayed when you open the app by holding the "wrong finger" on the biometric iPhone sensor.
  private getErrorText = () => {
    const textTryAgain = I18n.t("global.genericRetry");

    if (this.state.identificationByPinState === "failure") {
      this.setState({
        identificationByBiometryState: "unstarted"
      });
      return this.props.identificationFailState
        .filter(fs => fs.remainingAttempts <= maxAttempts - freeAttempts)
        .map(
          // here if the user finished his free attempts
          fd =>
            `${textTryAgain}. ${I18n.t(
              fd.remainingAttempts > 1
                ? "identification.fail.remainingAttempts"
                : "identification.fail.remainingAttemptSingle",
              { attempts: fd.remainingAttempts }
            )}`
        )
        .getOrElse(textTryAgain);
    }

    if (this.state.identificationByBiometryState === "failure") {
      this.setState({
        identificationByPinState: "unstarted"
      });
      return textTryAgain;
    }

    return undefined;
  };

  private renderErrorDescription = () =>
    maybeNotNullyString(this.getErrorText()).fold(undefined, des => (
      <Text
        alignCenter={true}
        bold={true}
        white={true}
        primary={false}
        accessible={true}
        ref={this.errorStatusRef}
      >
        {des}
      </Text>
    ));

  /**
   * Create handlers merging default internal actions (to manage the identification state)
   * with, if available, custom actions passed as props.
   */
  private onIdentificationCancelHandler(
    identificationCancelData: IdentificationCancelData
  ) {
    identificationCancelData.onCancel();
    this.props.onCancelIdentification();
  }

  private renderHeader(isValidatingTask: boolean) {
    return (
      <React.Fragment>
        <Text
          bold={true}
          alignCenter={true}
          style={styles.header}
          white={!isValidatingTask}
          dark={isValidatingTask}
          accessible={true}
          ref={this.headerRef}
        >
          {isValidatingTask
            ? I18n.t("identification.titleValidation")
            : fromNullable(this.props.profileName).fold(
                I18n.t("identification.title"),
                pN =>
                  I18n.t("identification.titleProfileName", {
                    profileName: pN
                  })
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
  }

  public render() {
    const { identificationProgressState, isFingerprintEnabled } = this.props;

    if (identificationProgressState.kind !== "started") {
      return null;
    }

    // The identification is started, we need to show the modal
    const { pin, isValidatingTask, identificationCancelData, shufflePad } =
      identificationProgressState;

    const { biometryType, countdown, identificationByBiometryState } =
      this.state;

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

    const defaultColor = isValidatingTask
      ? customVariables.contentPrimaryBackground
      : customVariables.colorWhite;

    const choosenTool = assistanceToolRemoteConfig(
      this.props.assistanceToolConfig
    );

    return !this.state.canInsertPinTooManyAttempts ? (
      IdentificationLockModal({ countdown })
    ) : (
      <Modal onRequestClose={onRequestCloseHandler}>
        <BaseScreenComponent
          accessibilityEvents={{ avoidNavigationEventsUsage: true }}
          accessibilityLabel={I18n.t("identification.title")}
          primary={!isValidatingTask}
          contextualHelpMarkdown={
            choosenTool === ToolEnum.instabug
              ? contextualHelpMarkdown
              : undefined
          }
          faqCategories={["unlock", "onboarding_pin", "onboarding_fingerprint"]}
          appLogo={true}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor={customVariables.contentPrimaryBackground}
          />
          <Content
            primary={!isValidatingTask}
            contentContainerStyle={styles.contentContainerStyle}
            noPadded
          >
            {this.renderHeader(isValidatingTask)}
            {this.renderErrorDescription()}
            <Pinpad
              onPinResetHandler={this.props.onPinResetHandler}
              isValidatingTask={isValidatingTask}
              isFingerprintEnabled={
                isFingerprintEnabled &&
                identificationByBiometryState !== "failure"
              }
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
                  ? () =>
                      this.onIdentificationCancelHandler(
                        identificationCancelData
                      )
                  : undefined
              }
              remainingAttempts={displayRemainingAttempts}
            />
            <View spacer={true} large={true} />
            {!isValidatingTask && (
              <View style={styles.bottomContainer}>
                <Link onPress={this.onLogout} weight="Bold" color="white">
                  {fromNullable(this.props.profileName).fold(
                    I18n.t("identification.logout"),
                    pN =>
                      I18n.t("identification.logoutProfileName", {
                        profileName: pN
                      })
                  )}
                </Link>
              </View>
            )}
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
    // We have a failure cause the biometry auth responded with a DeviceLocked or DeviceLockedPermanent code.
    // message should not include biometry instructions
    if (this.state.identificationByBiometryState === "failure") {
      return I18n.t("identification.subtitleCode");
    }

    switch (this.state.biometryType) {
      case "BIOMETRICS":
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
      this.setState(
        {
          identificationByPinState: "failure"
        },
        () => setAccessibilityFocus(this.errorStatusRef)
      );

      onIdentificationFailureHandler();
    }
  };

  private onFingerprintRequest = (onIdentificationSuccessHandler: () => void) =>
    biometricAuthenticationRequest(
      () => {
        this.setState({
          identificationByBiometryState: "unstarted"
        });
        onIdentificationSuccessHandler();
      },
      e => {
        // some error occured, enable pin insertion
        this.setState({
          biometryAuthAvailable: false
        });
        if (e.name === "DeviceLocked" || e.name === "DeviceLockedPermanent") {
          this.setState({
            identificationByBiometryState: "failure"
          });
        }
      }
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onPinResetHandler: () => dispatch(identificationPinReset()),
  onCancelIdentification: () => dispatch(identificationCancel()),
  onIdentificationSuccess: () => dispatch(identificationSuccess()),
  onIdentificationForceLogout: () => dispatch(identificationForceLogout()),
  onIdentificationFailure: () => dispatch(identificationFailure())
});

const mapStateToProps = (state: GlobalState) => ({
  identificationProgressState: progressSelector(state),
  identificationFailState: identificationFailSelector(state),
  isFingerprintEnabled: isFingerprintEnabledSelector(state),
  appState: appCurrentStateSelector(state),
  profileName: profileNameSelector(state),
  assistanceToolConfig: assistanceToolConfigSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IdentificationModal);
