import {
  ContentWrapper,
  H2,
  IOButton,
  IOColors,
  IOPictograms,
  IconButton,
  Pictogram,
  ToastNotification,
  VSpacer,
  useIOFontDynamicScale,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import _ from "lodash";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { useDetectSmallScreen } from "../../../hooks/useDetectSmallScreen";
import { useIOSelector } from "../../../store/hooks";
import { appCurrentStateSelector } from "../../../store/reducers/appState";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { biometricAuthenticationRequest } from "../../../utils/biometrics";
import { useBiometricType } from "../../../utils/hooks/useBiometricType";
import { usePrevious } from "../../../utils/hooks/usePrevious";
import { areTwoMinElapsedFromLastActivity } from "../../authentication/fastLogin/store/actions/sessionRefreshActions";
import { refreshSessionToken } from "../../authentication/fastLogin/store/actions/tokenRefreshActions";
import {
  hasTwoMinutesElapsedSinceLastActivitySelector,
  isFastLoginEnabledSelector
} from "../../authentication/fastLogin/store/selectors";
import { profileNameSelector } from "../../settings/common/store/selectors";
import { IdentificationNumberPad } from "../components/IdentificationNumberPad";
import {
  identificationCancel,
  identificationFailure,
  identificationPinReset,
  identificationSuccess
} from "../store/actions";
import { IdentificationCancelData, maxAttempts } from "../store/reducers";
import {
  identificationFailSelector,
  progressSelector
} from "../store/selectors";
import {
  FAIL_ATTEMPTS_TO_SHOW_ALERT,
  IdentificationInstructionsComponent,
  getBiometryIconName,
  handleAndroidBackNavigation
} from "../utils";
import { IdentificationLockModal } from "./IdentificationLockModal";

const VERTICAL_PADDING = 16;
const A11Y_FOCUS_DELAY = 1000 as Millisecond;

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export const IdentificationModal = () => {
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const showRetryText = useRef(false);
  const headerRef = useRef<View>(null);
  const errorStatusRef = useRef<View>(null);

  const theme = useIOTheme();
  const { isDeviceScreenSmall } = useDetectSmallScreen();
  const { hugeFontEnabled } = useIOFontDynamicScale();

  const appState = useIOSelector(appCurrentStateSelector);
  const previousAppState = usePrevious(appState);
  const identificationProgressState = useIOSelector(progressSelector);
  const hasTwoMinutesElapsedSinceLastActivity = useIOSelector(
    hasTwoMinutesElapsedSinceLastActivitySelector
  );

  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);

  const previousIdentificationProgressState = usePrevious(
    identificationProgressState
  );
  const identificationFailState = useIOSelector(
    identificationFailSelector,
    // Since the identificationFailState is an Option,
    // we need to performs a deep comparison between
    // two values to determine if they are equivalent
    // to avoid unnecessary re-renders.
    (l, r) => _.isEqual(l, r)
  );
  const name = useIOSelector(profileNameSelector);
  const { biometricType, isFingerprintEnabled } = useBiometricType();

  // eslint-disable-next-line functional/no-let
  let pin = "";
  // eslint-disable-next-line functional/no-let
  let isValidatingTask = false;
  // eslint-disable-next-line functional/no-let
  let cancelData: IdentificationCancelData | undefined;
  if (identificationProgressState.kind === "started") {
    pin = identificationProgressState.pin;
    isValidatingTask = identificationProgressState.isValidatingTask;
    const { identificationCancelData } = identificationProgressState;
    cancelData = identificationCancelData;
  }

  const forgotCodeLabel = `${I18n.t(
    "identification.unlockCode.reset.button"
  )} ${I18n.t("identification.unlockCode.reset.code")}?`;
  const closeButtonLabel = cancelData?.label ?? I18n.t("global.buttons.close");
  const textTryAgain = I18n.t("global.genericRetry");

  const dispatch = useDispatch();
  const onIdentificationCancel = useCallback(() => {
    dispatch(identificationCancel());
  }, [dispatch]);
  const onIdentificationSuccess = useCallback(
    (isBiometric: boolean) => {
      dispatch(identificationSuccess({ isBiometric }));
    },
    [dispatch]
  );

  const onPinResetHandler = useCallback(() => {
    dispatch(identificationPinReset());
  }, [dispatch]);

  const onIdentificationFailure = useCallback(() => {
    dispatch(identificationFailure());
  }, [dispatch]);

  const onSuccessDispatchTokenRefresh = useCallback(() => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: false,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
    dispatch(areTwoMinElapsedFromLastActivity({ hasTwoMinPassed: false }));
  }, [dispatch]);

  const onIdentificationFailureHandler = useCallback(() => {
    const forceLogout = pipe(
      identificationFailState,
      O.map(failState => failState.remainingAttempts === 1),
      O.getOrElse(() => false)
    );
    if (forceLogout) {
      // eslint-disable-next-line functional/immutable-data
      showRetryText.current = false;
      onPinResetHandler();
    } else {
      onIdentificationFailure();
    }
  }, [identificationFailState, onIdentificationFailure, onPinResetHandler]);

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
      /**
       * if the identification was successful, if at least two minutes
       * have passed since the last time the app was placed in the
       * background and returned to the foreground then the dispatch
       * of the action that refreshes the session will be performed
       */
      if (hasTwoMinutesElapsedSinceLastActivity && isFastLoginEnabled) {
        onSuccessDispatchTokenRefresh();
      }
    },
    [
      hasTwoMinutesElapsedSinceLastActivity,
      identificationProgressState,
      isFastLoginEnabled,
      onIdentificationSuccess,
      onSuccessDispatchTokenRefresh
    ]
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

  const biometricsConfig = useMemo(
    () =>
      biometricType
        ? {
            biometricType,
            biometricAccessibilityLabel: getBiometryIconName(biometricType),
            onBiometricPress: () => onFingerprintRequest()
          }
        : {},
    [biometricType, onFingerprintRequest]
  );

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
    : I18n.t("identification.titleOffline");

  const onPinValidated = useCallback(
    (isValidated: boolean) => {
      if (isValidated) {
        // eslint-disable-next-line functional/immutable-data
        showRetryText.current = false;
        onIdentificationSuccessHandler(false);
      } else {
        // eslint-disable-next-line functional/immutable-data
        showRetryText.current = true;
        onIdentificationFailureHandler();
      }
    },
    [onIdentificationFailureHandler, onIdentificationSuccessHandler]
  );

  const NumberPad = memo(() => (
    <IdentificationNumberPad
      pin={pin}
      pinValidation={onPinValidated}
      numberPadVariant={"primary"}
      biometricsConfig={biometricsConfig}
    />
  ));

  const { top: safeAreaTop } = useSafeAreaInsets();
  const topInset =
    Platform.OS === "android"
      ? safeAreaTop || StatusBar.currentHeight || 0
      : safeAreaTop;

  const pictogramKey: IOPictograms = isValidatingTask ? "passcode" : "key";

  // Managing the countdown and the remaining attempts
  // this way is simpler and more predictable
  // instead of using useEffect and ref and state.
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
  }

  const remainingAttemptsToShowAlert =
    remainingAttempts <= FAIL_ATTEMPTS_TO_SHOW_ALERT;
  const showToastNotificationAlert =
    remainingAttemptsToShowAlert || showRetryText.current;

  if (showRetryText.current) {
    setAccessibilityFocus(errorStatusRef, A11Y_FOCUS_DELAY);
  }

  const identificationContext =
    identificationProgressState.identificationContext;

  return showLockModal ? (
    <IdentificationLockModal
      countdownInMs={countdownInMs}
      timeSpanInSeconds={timeSpanBetweenAttemptsInSeconds}
    />
  ) : (
    <Modal
      testID="identification-modal"
      statusBarTranslucent
      transparent
      onRequestClose={() =>
        handleAndroidBackNavigation(
          identificationContext,
          onIdentificationCancelHandler
        )
      }
    >
      <StatusBar
        barStyle={"light-content"}
        backgroundColor={"transparent"}
        translucent
      />
      <View
        style={[
          styles.contentWrapper,
          { backgroundColor: IOColors[theme["appBackground-accent"]] }
        ]}
      >
        {isValidatingTask && (
          <View
            accessible
            style={[styles.closeButton, { marginTop: topInset }]}
          >
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
          alwaysBounceVertical={false}
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
              ) : (isDeviceScreenSmall || hugeFontEnabled) &&
                isValidatingTask ? null : (
                <View style={{ alignItems: "center" }}>
                  <Pictogram
                    pictogramStyle="light-content"
                    name={pictogramKey}
                    size={64}
                  />
                </View>
              )}
              <View accessible ref={headerRef} style={{ alignItems: "center" }}>
                <VSpacer size={8} />
                <H2 color={"white"} style={{ textAlign: "center" }}>
                  {titleLabel}
                </H2>
                <VSpacer size={8} />
                <IdentificationInstructionsComponent
                  biometricType={biometricType}
                  isBimoetricIdentificatoinFailed={isBiometricLocked}
                />
              </View>
            </View>
            <VSpacer size={isDeviceScreenSmall ? 16 : 32} />
            <NumberPad />
            <View>
              <VSpacer size={isDeviceScreenSmall ? 16 : 32} />
              <View style={{ alignSelf: "center" }}>
                <IOButton
                  variant="link"
                  textAlign="center"
                  color="contrast"
                  /* Don't limit number of lines
                    when larger text is enabled */
                  numberOfLines={0}
                  accessibilityLabel={forgotCodeLabel}
                  label={forgotCodeLabel}
                  onPress={confirmResetAlert}
                />
                <VSpacer size={VERTICAL_PADDING} />
              </View>
            </View>
          </ContentWrapper>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  contentWrapper: { flexGrow: 1 },
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
