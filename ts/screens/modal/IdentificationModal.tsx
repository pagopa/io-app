import * as React from "react";
import { useCallback, useState, useRef } from "react";
import {
  CodeInput,
  H2,
  NumberPad,
  VSpacer,
  LabelSmallAlt,
  Pictogram,
  Body,
  IconButton,
  ContentWrapper,
  ButtonLink,
  IOStyles,
  ToastNotification,
  BiometricsValidType,
  IOPictograms
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Alert, ColorSchemeName, Modal, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "../../i18n";
import { IOStyleVariables } from "../../components/core/variables/IOStyleVariables";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationSuccess
} from "../../store/actions/identification";
import { useIOSelector } from "../../store/hooks";
import {
  identificationFailSelector,
  maxAttempts,
  progressSelector
} from "../../store/reducers/identification";
import { useBiometricType } from "../../utils/hooks/useBiometricType";
import { profileNameSelector } from "../../store/reducers/profile";
import { biometricAuthenticationRequest } from "../../utils/biometrics";
import { appCurrentStateSelector } from "../../store/reducers/appState";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { IdentificationLockModal } from "./IdentificationLockModal";

const PIN_LENGTH = 6;
const VERTICAL_PADDING = 16;
const FAIL_ATTEMPTS_TO_SHOW_ALERT = 4;

const onRequestCloseHandler = () => undefined;

const getInstructions = (
  biometricType: BiometricsValidType | undefined,
  isBimoetricIdentificatoinFailed: boolean = false
) => {
  if (isBimoetricIdentificatoinFailed) {
    return I18n.t("identification.subtitleCode");
  }

  switch (biometricType) {
    case "BIOMETRICS":
      return I18n.t("identification.subtitleCodeFingerprint");
    case "FACE_ID":
      return I18n.t("identification.subtitleCodeFaceId");
    case "TOUCH_ID":
      return I18n.t("identification.subtitleCodeFingerprint");
    default:
      return I18n.t("identification.subtitleCode");
  }
};

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
const IdentificationModal = () => {
  console.log("Refreshing IdentificationModal 🔁");
  const [value, setValue] = useState("");
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const isPinValidRef = useRef(true);
  const showRetryText = useRef(false);
  const headerRef = useRef<View>(null);
  const errorStatusRef = useRef<View>(null);
  // TODO: forced new blue until we have a proper color mapping on the design system
  const isDesignSystemEnabled = true; // useIOSelector(isDesignSystemEnabledSelector);
  const colorScheme: ColorSchemeName = "light";

  const blueColor = IOStyleVariables.colorPrimary(
    colorScheme,
    isDesignSystemEnabled
  );

  const appState = useIOSelector(appCurrentStateSelector);
  const previousAppState = usePrevious(appState);
  const identificationProgressState = useIOSelector(progressSelector);
  const previousIdentificationProgressState = usePrevious(
    identificationProgressState
  );
  const identificationFailState = useIOSelector(identificationFailSelector);
  const name = useIOSelector(profileNameSelector);
  const { biometricType, isFingerprintEnabled } = useBiometricType();

  // eslint-disable-next-line functional/no-let
  let pin = "";
  // eslint-disable-next-line functional/no-let
  let isValidatingTask = false;
  if (identificationProgressState.kind === "started") {
    pin = identificationProgressState.pin;
    isValidatingTask = identificationProgressState.isValidatingTask;
  }

  const biometricsConfig = biometricType
    ? {
        biometricType,
        biometricAccessibilityLabel: "Face ID",
        onBiometricPress: () => onFingerprintRequest()
      }
    : {};

  const instructions = getInstructions(biometricType, isBiometricLocked);
  const forgotCodeLabel = `${I18n.t(
    "identification.unlockCode.reset.button"
  )} ${I18n.t("identification.unlockCode.reset.code")}?`;
  const closeButtonLabel = I18n.t("global.buttons.close");
  const textTryAgain = I18n.t("global.genericRetry");

  const dispatch = useDispatch();
  const onIdentificationCancel = useCallback(() => {
    dispatch(identificationCancel());
  }, [dispatch]);
  const onIdentificationSuccess = useCallback(
    (isBiometric: boolean) => {
      dispatch(identificationSuccess(isBiometric));
    },
    [dispatch]
  );
  const onIdentificationForceLogout = useCallback(() => {
    dispatch(identificationForceLogout());
  }, [dispatch]);
  const onIdentificationFailure = useCallback(() => {
    dispatch(identificationFailure());
  }, [dispatch]);

  const onIdentificationFailureHandler = useCallback(() => {
    const forceLogout = pipe(
      identificationFailState,
      O.map(failState => failState.remainingAttempts === 1),
      O.getOrElse(() => false)
    );
    if (forceLogout) {
      onIdentificationForceLogout();
    } else {
      onIdentificationFailure();
    }
  }, [
    identificationFailState,
    onIdentificationFailure,
    onIdentificationForceLogout
  ]);

  const onIdentificationSuccessHandler = useCallback(
    (isBiometric: boolean) => {
      if (identificationProgressState.kind !== "started") {
        return;
      }

      const { identificationSuccessData } = identificationProgressState;

      if (identificationSuccessData) {
        identificationSuccessData.onSuccess();
      }
      onIdentificationSuccess(isBiometric);
    },
    [identificationProgressState, onIdentificationSuccess]
  );

  const onIdentificationCancelHandler = useCallback(() => {
    if (identificationProgressState.kind !== "started") {
      return;
    }

    const { identificationCancelData } = identificationProgressState;

    identificationCancelData?.onCancel();
    onIdentificationCancel();
  }, [identificationProgressState, onIdentificationCancel]);

  const onFingerprintRequest = useCallback(
    () =>
      biometricAuthenticationRequest(
        () => {
          onIdentificationSuccessHandler(true);
        },
        e => {
          if (e.name === "DeviceLocked" || e.name === "DeviceLockedPermanent") {
            setIsBiometricLocked(true);
          }
        }
      ),
    [onIdentificationSuccessHandler, setIsBiometricLocked]
  );

  if (!isPinValidRef.current) {
    // eslint-disable-next-line functional/immutable-data
    isPinValidRef.current = true;
    // eslint-disable-next-line functional/immutable-data
    showRetryText.current = true;
    onIdentificationFailureHandler();
  }

  const onValueChange = (v: string) => {
    if (v.length <= PIN_LENGTH) {
      setValue(v);
    }
  };

  const onPinResetHandler = useCallback(() => {
    dispatch(identificationPinReset());
  }, [dispatch]);

  const confirmResetAlert = useCallback(
    () =>
      Alert.alert(
        I18n.t("identification.forgetCode.confirmTitle"),
        I18n.t(
          isValidatingTask
            ? "identification.forgetCode.confirmMsgWithTask"
            : "identification.forgetCode.confirmMsg"
        ),
        [
          {
            text: I18n.t("global.buttons.confirm"),
            style: "default",
            onPress: onPinResetHandler
          },
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          }
        ],
        { cancelable: false }
      ),
    [isValidatingTask, onPinResetHandler]
  );

  const titleLabel = isValidatingTask
    ? I18n.t("identification.titleValidation")
    : name
    ? I18n.t("identification.title", { name })
    : "";

  const onPinValidated = useCallback(
    (v: string) => {
      if (v === pin) {
        // Clear the inserted value
        setValue("");
        // Dispatch the success action
        onIdentificationSuccessHandler(false);
        // eslint-disable-next-line functional/immutable-data
        isPinValidRef.current = true;
      } else {
        // eslint-disable-next-line functional/immutable-data
        isPinValidRef.current = false;
      }
      return isPinValidRef.current;
    },
    [onIdentificationSuccessHandler, pin]
  );

  const pictogramKey: IOPictograms = isValidatingTask ? "passcode" : "key";

  // eslint-disable-next-line functional/no-let
  let countdownInMs = 0 as Millisecond;
  // eslint-disable-next-line functional/no-let
  let timeSpanBetweenAttemptsInSeconds = 0;
  // eslint-disable-next-line functional/no-let
  let showLockModal = false;
  // eslint-disable-next-line functional/no-let
  let remainingAttempts = maxAttempts;
  if (O.isSome(identificationFailState)) {
    showLockModal = identificationFailState.value.showLockModal ?? false;
    remainingAttempts = identificationFailState.value.remainingAttempts;
    timeSpanBetweenAttemptsInSeconds =
      identificationFailState.value.timespanBetweenAttempts;
    const nowInMs = new Date().getTime();
    const nextLegalAttemptInMs =
      identificationFailState.value.nextLegalAttempt.getTime();
    const elapsedTimeInMs = nextLegalAttemptInMs - nowInMs;
    // This screen is refreshing at every app state change.
    // So we can rely on the elapsed time to show the lock modal.
    if (showLockModal && elapsedTimeInMs > 0) {
      // We need to show the lock modal with the countdown
      // updated with the remaining time to handle cases where
      // the app has been killed and restarted.
      // eslint-disable-next-line functional/immutable-data
      countdownInMs = elapsedTimeInMs as Millisecond;
    }
  }
  const remainingAttemptsText = I18n.t(
    remainingAttempts > 1
      ? "identification.fail.remainingAttempts"
      : "identification.fail.remainingAttemptSingle",
    {
      attempts: remainingAttempts
    }
  );

  // If the authentication process is not started, we don't show the modal.
  // We need to put this before the biometric request,
  // to avoid the biometric request to be triggered when the modal is not shown.
  if (identificationProgressState.kind !== "started") {
    return null;
  }

  // When app becomes active from background the state of TouchID support
  // must be updated, because it might be switched off.
  // Don't do this check if I can't authenticate
  // for too many attempts.
  if (
    !showLockModal &&
    isFingerprintEnabled &&
    ((previousAppState === "background" && appState === "active") ||
      (previousIdentificationProgressState?.kind !== "started" &&
        identificationProgressState.kind === "started"))
  ) {
    void onFingerprintRequest();
    setAccessibilityFocus(headerRef);
  }

  const remainingAttemptsToShowAlert =
    remainingAttempts <= FAIL_ATTEMPTS_TO_SHOW_ALERT;
  const showToastNotificationAlert =
    remainingAttemptsToShowAlert || showRetryText.current;

  return showLockModal ? (
    <IdentificationLockModal
      countdownInMs={countdownInMs}
      timeSpanInSeconds={timeSpanBetweenAttemptsInSeconds}
    />
  ) : (
    <Modal
      statusBarTranslucent
      transparent
      onRequestClose={onRequestCloseHandler}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: blueColor }]}>
        {isValidatingTask && (
          <View style={styles.closeButton}>
            <ContentWrapper>
              <VSpacer size={VERTICAL_PADDING} />
              <IconButton
                icon={"closeLarge"}
                color="contrast"
                onPress={() => {
                  onIdentificationCancelHandler();
                }}
                accessibilityLabel={closeButtonLabel}
              />
            </ContentWrapper>
          </View>
        )}
        <ScrollView
          centerContent={true}
          contentContainerStyle={[
            styles.scrollViewContentContainer,
            {
              justifyContent: isValidatingTask ? undefined : "center"
            }
          ]}
        >
          <ContentWrapper>
            <View>
              <VSpacer size={16} />
              {showToastNotificationAlert ? (
                <View
                  accessible
                  ref={errorStatusRef}
                  style={styles.alertContainer}
                >
                  <ToastNotification
                    message={
                      remainingAttemptsToShowAlert
                        ? remainingAttemptsText
                        : textTryAgain
                    }
                    icon="warningFilled"
                    variant="warning"
                  />
                </View>
              ) : (
                <View style={IOStyles.alignCenter}>
                  <Pictogram
                    pictogramStyle="light-content"
                    name={pictogramKey}
                    size={64}
                  />
                </View>
              )}
              <View accessible ref={headerRef} style={IOStyles.alignCenter}>
                <VSpacer size={8} />
                <H2 color={"white"}>{titleLabel}</H2>
                <VSpacer size={8} />
                <Body accessibilityLabel={instructions} color={"white"}>
                  {instructions}
                </Body>
              </View>
            </View>
            <VSpacer size={32} />
            <View style={IOStyles.alignCenter}>
              <View style={styles.smallPinLabel}>
                <LabelSmallAlt color={"white"}>{value}</LabelSmallAlt>
              </View>
              <CodeInput
                value={value}
                length={PIN_LENGTH}
                variant={"light"}
                onValueChange={onValueChange}
                onValidate={onPinValidated}
              />
            </View>
            <VSpacer size={48} />
            <View>
              <NumberPad
                value={value}
                deleteAccessibilityLabel="Delete"
                onValueChange={onValueChange}
                variant={"dark"} // TODO: missing mapping for standard blue
                {...biometricsConfig}
              />
              <VSpacer size={32} />
              <View style={IOStyles.selfCenter}>
                <ButtonLink
                  accessibilityLabel={forgotCodeLabel}
                  color="contrast"
                  label={forgotCodeLabel}
                  onPress={confirmResetAlert}
                />
                <VSpacer size={VERTICAL_PADDING} />
              </View>
            </View>
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flexGrow: 1 },
  closeButton: {
    zIndex: 100,
    flexGrow: 1,
    alignItems: "flex-end"
  },
  scrollViewContentContainer: {
    flexGrow: 1
  },
  alertContainer: {
    flexGrow: 1
  },
  smallPinLabel: {
    position: "absolute",
    alignItems: "center",
    opacity: 0.5,
    bottom: -32
  }
});

export default IdentificationModal;
