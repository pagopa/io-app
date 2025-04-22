/* eslint-disable functional/immutable-data */
/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import { memo, useEffect, useRef, useState } from "react";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { AccessibilityInfo, View } from "react-native";
import I18n from "../../../i18n";
import {
  isItwOfflineAccessEnabledSelector,
  isMixpanelEnabled as isMixpanelEnabledSelector
} from "../../../store/reducers/persistedPreferences";
import { trackIngressScreen } from "../../settings/common/analytics";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isBackendStatusLoadedSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { setIsBlockingScreen, setOfflineAccessReason } from "../store/actions";
import ModalSectionStatusComponent from "../../../components/SectionStatus/modal";
import { isMixpanelInitializedSelector } from "../../mixpanel/store/selectors";
import {
  trackIngressCdnSystemError,
  trackIngressNoInternetConnection,
  trackIngressServicesSlowDown,
  trackIngressTimeout
} from "../analytics";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import waiting from "../../../../assets/animated-pictograms/Waiting.json";
import { startupLoadSuccess } from "../../../store/actions/startup";
import { StartupStatusEnum } from "../../../store/reducers/startup";
import { isConnectedSelector } from "../../connectivity/store/selectors";
import { itwLifecycleIsOperationalOrValid } from "../../itwallet/lifecycle/store/selectors";
import { identificationRequest } from "../../identification/store/actions";
import { OfflineAccessReasonEnum } from "../store/reducer";

const TIMEOUT_CHANGE_LABEL = (5 * 1000) as Millisecond;
const TIMEOUT_BLOCKING_SCREEN = (10 * 1000) as Millisecond;

export const IngressScreen = () => {
  const isMixpanelInitialized = useIOSelector(isMixpanelInitializedSelector);
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector);
  const dispatch = useIODispatch();
  const isConnected = useIOSelector(isConnectedSelector);
  const selectItwLifecycleIsOperationalOrValid = useIOSelector(
    itwLifecycleIsOperationalOrValid
  );
  const isOfflineAccessEnabled = useIOSelector(
    isItwOfflineAccessEnabledSelector
  );

  const [showBlockingScreen, setShowBlockingScreen] = useState(false);
  const [contentTitle, setContentTitle] = useState(I18n.t("startup.title"));

  useEffect(() => {
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    AccessibilityInfo.announceForAccessibilityWithOptions(contentTitle, {
      queue: true
    });
  }, [contentTitle]);

  useEffect(() => {
    // `isMixpanelEnabled` mustn't be `false`
    if (isMixpanelInitialized && isMixpanelEnabled !== false) {
      trackIngressScreen();
    }
  }, [isMixpanelInitialized, isMixpanelEnabled]);

  useEffect(() => {
    const timeouts: Array<number> = [];

    timeouts.push(
      setTimeout(() => {
        setContentTitle(I18n.t("startup.title2"));
        timeouts.shift();
      }, TIMEOUT_CHANGE_LABEL)
    );

    timeouts.push(
      setTimeout(() => {
        setShowBlockingScreen(true);
        dispatch(setIsBlockingScreen());
        timeouts.shift();
      }, TIMEOUT_BLOCKING_SCREEN)
    );

    return () => {
      timeouts?.forEach(clearTimeout);
    };
  }, [dispatch]);

  useEffect(() => {
    const visualizeOfflineWallet =
      isConnected === false &&
      selectItwLifecycleIsOperationalOrValid &&
      isOfflineAccessEnabled;

    if (visualizeOfflineWallet) {
      // This dispatch could be placed inside `onSuccess`,
      // but executing it here ensures the startup saga stops immediately.
      dispatch(setOfflineAccessReason(OfflineAccessReasonEnum.DEVICE_OFFLINE));
      dispatch(
        identificationRequest(false, false, undefined, undefined, {
          onSuccess: () => {
            // This dispatch mounts the new offline navigator.
            // It must be initialized **after** the user completes
            // biometric authentication to prevent graphical glitches.
            dispatch(startupLoadSuccess(StartupStatusEnum.OFFLINE));
          }
        })
      );
    }
  }, [
    dispatch,
    isConnected,
    isOfflineAccessEnabled,
    selectItwLifecycleIsOperationalOrValid
  ]);

  if (
    isConnected === false &&
    (!selectItwLifecycleIsOperationalOrValid || !isOfflineAccessEnabled)
  ) {
    return <IngressScreenNoInternetConnection />;
  }

  if (showBlockingScreen) {
    return <IngressScreenBlockingError />;
  }

  return (
    <>
      <ModalSectionStatusComponent
        sectionKey="ingress"
        sticky
        trackingAction={trackIngressServicesSlowDown}
      />
      <LoadingScreenContent
        testID="ingress-screen-loader-id"
        contentTitle={contentTitle}
        animatedPictogramSource={waiting}
      />
    </>
  );
};

const IngressScreenNoInternetConnection = memo(() => {
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector);
  const isMixpanelInitialized = useIOSelector(isMixpanelInitializedSelector);

  useEffect(() => {
    if (isMixpanelInitialized && isMixpanelEnabled !== false) {
      void trackIngressNoInternetConnection();
    }
  }, [isMixpanelEnabled, isMixpanelInitialized]);

  return (
    <OperationResultScreenContent
      testID="device-connection-lost-id"
      pictogram="lostConnection"
      title={I18n.t("startup.connection_lost.title")}
      subtitle={I18n.t("startup.connection_lost.description")}
    />
  );
});

const IngressScreenBlockingError = memo(() => {
  const operationRef = useRef<View>(null);
  const isBackendStatusLoaded = useIOSelector(isBackendStatusLoadedSelector);
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector);

  useEffect(() => {
    setAccessibilityFocus(operationRef);
  }, []);

  useEffect(() => {
    // It's not necessary to check if mixpanel is initialized since this screen is shown after 10 seconds.
    // If mixpanel is not initialized at that time, we have an issue spanning, system-wide.
    if (isMixpanelEnabled !== false) {
      if (isBackendStatusLoaded) {
        void trackIngressTimeout();
      } else {
        void trackIngressCdnSystemError();
      }
    }
  }, [isBackendStatusLoaded, isMixpanelEnabled]);

  return (
    <OperationResultScreenContent
      ref={operationRef}
      testID="device-blocking-screen-id"
      {...(isBackendStatusLoaded
        ? {
            pictogram: "time",
            title: I18n.t("startup.slowdowns_results_screen.title"),
            subtitle: I18n.t("startup.slowdowns_results_screen.subtitle")
          }
        : {
            pictogram: "umbrella",
            title: I18n.t("startup.cdn_unreachable_results_screen.title"),
            subtitle: I18n.t("startup.cdn_unreachable_results_screen.subtitle")
          })}
    />
  );
});
