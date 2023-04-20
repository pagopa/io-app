import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { View, Alert, Modal, StatusBar, StyleSheet, Text } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Link } from "../../components/core/typography/Link";
import Pinpad from "../../components/Pinpad";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationSuccess
} from "../../store/actions/identification";
import { appCurrentStateSelector } from "../../store/reducers/appState";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import {
  freeAttempts,
  IdentificationCancelData,
  identificationFailSelector,
  maxAttempts,
  progressSelector
} from "../../store/reducers/identification";
import { isFingerprintEnabledSelector } from "../../store/reducers/persistedPreferences";
import { profileNameSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { setAccessibilityFocus } from "../../utils/accessibility";
import {
  biometricAuthenticationRequest,
  BiometricsValidType,
  getBiometricsType,
  isBiometricsValidType
} from "../../utils/biometrics";
import { maybeNotNullyString } from "../../utils/strings";

import { IOColors } from "../../components/core/variables/IOColors";
import customVariables from "../../theme/variables";

import { VSpacer } from "../../components/core/spacer/Spacer";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { Label } from "../../components/core/typography/Label";
import { Body } from "../../components/core/typography/Body";
import { H2 } from "../../components/core/typography/H2";
import { IdentificationLockModal } from "./IdentificationLockModal";

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

const checkPinInterval = 100 as Millisecond;

// the threshold of attempts after which it is necessary to activate the timer check
const checkTimerThreshold = maxAttempts - freeAttempts;

const onRequestCloseHandler = () => undefined;

const styles = StyleSheet.create({
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
      canInsertPinTooManyAttempts: O.isNone(this.props.identificationFailState)
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
    pipe(
      this.props.identificationFailState,
      O.map(errorData => {
        const now = new Date();
        const canInsertPinTooManyAttempts = errorData.nextLegalAttempt <= now;
        this.setState({
          canInsertPinTooManyAttempts,
          countdown: (errorData.nextLegalAttempt.getTime() -
            now.getTime()) as Millisecond
        });
        return canInsertPinTooManyAttempts;
      })
    );

  /**
   * Activate the interval check on the pin state if the condition is satisfied
   */
  private scheduleCanInsertPinUpdate = () => {
    pipe(
      this.props.identificationFailState,
      O.map(failState => {
        if (failState.remainingAttempts < checkTimerThreshold) {
          this.updateCanInsertPinTooManyAttempts();
          // eslint-disable-next-line
          this.idUpdateCanInsertPinTooManyAttempts = setInterval(
            this.updateCanInsertPinTooManyAttempts,
            checkPinInterval
          );
        }
      })
    );
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
    pipe(
      this.updateCanInsertPinTooManyAttempts(),
      O.map(_ => this.scheduleCanInsertPinUpdate())
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
      this.setState((_, props) => ({
        biometryAuthAvailable: pipe(
          props.isFingerprintEnabled,
          O.fromNullable,
          O.getOrElse(() => false)
        )
      }));
    }

    const previousAttempts = pipe(
      prevProps.identificationFailState,
      O.fold(
        () => Number.MAX_VALUE,
        x => x.remainingAttempts
      )
    );

    const currentAttempts = pipe(
      this.props.identificationFailState,
      O.fold(
        () => Number.MAX_VALUE,
        x => x.remainingAttempts
      )
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
      const caninsertPin = pipe(
        this.updateCanInsertPinTooManyAttempts(),
        O.getOrElse(() => true)
      );
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

    const forceLogout = pipe(
      identificationFailState,
      O.map(failState => failState.remainingAttempts === 1),
      O.getOrElse(() => false)
    );
    if (forceLogout) {
      this.props.onIdentificationForceLogout();
    } else {
      this.props.onIdentificationFailure();
    }
  };

  private loadAlertTexts = (
    profileName: string | undefined
  ): [string, string] =>
    pipe(
      profileName,
      O.fromNullable,
      O.fold(
        () => [
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
      )
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
      return pipe(
        this.props.identificationFailState,
        O.filter(fs => fs.remainingAttempts <= maxAttempts - freeAttempts),
        O.map(
          // here if the user finished his free attempts
          fd =>
            `${textTryAgain}. ${I18n.t(
              fd.remainingAttempts > 1
                ? "identification.fail.remainingAttempts"
                : "identification.fail.remainingAttemptSingle",
              { attempts: fd.remainingAttempts }
            )}`
        ),
        O.getOrElse(() => textTryAgain)
      );
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
    pipe(
      maybeNotNullyString(this.getErrorText()),
      O.fold(
        () => undefined,
        des => (
          <View style={IOStyles.alignCenter}>
            <Label
              weight="Bold"
              color="white"
              accessible={true}
              ref={this.errorStatusRef}
            >
              {des}
            </Label>
          </View>
        )
      )
    );

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
      <View style={IOStyles.alignCenter}>
        <H2
          weight="Bold"
          color={isValidatingTask ? "bluegreyDark" : "white"}
          accessible={true}
          ref={this.headerRef}
        >
          {isValidatingTask
            ? I18n.t("identification.titleValidation")
            : pipe(
                this.props.profileName,
                O.fromNullable,
                O.fold(
                  () => I18n.t("identification.title"),
                  pN =>
                    I18n.t("identification.titleProfileName", {
                      profileName: pN
                    })
                )
              )}
        </H2>
        <Body color={isValidatingTask ? "bluegreyDark" : "white"}>
          {this.getInstructions()}
        </Body>
      </View>
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
    const displayRemainingAttempts = pipe(
      this.props.identificationFailState,
      O.fold(
        () => undefined,
        failState =>
          failState.remainingAttempts <= maxAttempts - freeAttempts
            ? failState.remainingAttempts
            : undefined
      )
    );

    const defaultColor = isValidatingTask
      ? customVariables.contentPrimaryBackground
      : IOColors.white;

    return !this.state.canInsertPinTooManyAttempts ? (
      IdentificationLockModal({ countdown })
    ) : (
      <Modal onRequestClose={onRequestCloseHandler}>
        <BaseScreenComponent
          accessibilityEvents={{ avoidNavigationEventsUsage: true }}
          accessibilityLabel={I18n.t("identification.title")}
          primary={!isValidatingTask}
          showChat={false}
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
            <VSpacer size={24} />
            {!isValidatingTask && (
              <View style={styles.bottomContainer}>
                <Link onPress={this.onLogout} weight="Bold" color="white">
                  {pipe(
                    this.props.profileName,
                    O.fromNullable,
                    O.fold(
                      () => I18n.t("identification.logout"),
                      pN =>
                        I18n.t("identification.logoutProfileName", {
                          profileName: pN
                        })
                    )
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
