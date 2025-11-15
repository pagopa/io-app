/* eslint-disable functional/immutable-data */
/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { AccessibilityInfo, View } from "react-native";
import I18n from "i18next";
import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../store/reducers/persistedPreferences";
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
  trackIngressOfflineWalletBannerCTAClicked,
  trackIngressServicesSlowDown,
  trackIngressTimeout,
  trackSettingsDiscoverBannerVisualized
} from "../analytics";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { startupLoadSuccess } from "../../../store/actions/startup";
import { StartupStatusEnum } from "../../../store/reducers/startup";
import { isConnectedSelector } from "../../connectivity/store/selectors";
import { identificationRequest } from "../../identification/store/actions";
import { OfflineAccessReasonEnum } from "../store/reducer";
import { itwOfflineAccessAvailableSelector } from "../../itwallet/common/store/selectors";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { IdentificationBackActionType } from "../../identification/store/reducers";
import { profileSelector } from "../../settings/common/store/selectors";
import { sessionInfoSelector } from "../../authentication/common/store/selectors";
import { checkSessionErrorSelector } from "../store/selectors";
import { PublicSession } from "../../../../definitions/session_manager/PublicSession";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { ProfileError } from "../../settings/common/store/types";

const TIMEOUT_CHANGE_LABEL = (5 * 1000) as Millisecond;
const TIMEOUT_BLOCKING_SCREEN = (25 * 1000) as Millisecond;

const getApiFailureValue = (
  isConnected: boolean | undefined,
  sessionLoaded: O.Option<PublicSession>,
  profileLoaded: pot.Pot<InitializedProfile, ProfileError>,
  checkSession: boolean
): string => {
  const apiFailures: Array<string> = [];

  // Add "ping" if isConnected is undefined
  if (isConnected === undefined) {
    apiFailures.push("ping");
  }

  // Add "get session" if sessionLoaded is None (error loading session)
  // OR if there was a checkCurrentSession.failure
  if (O.isNone(sessionLoaded) || checkSession) {
    apiFailures.push("get session");
  }

  // Add "get profile" if profileLoaded is error or someError
  if (pot.isError(profileLoaded)) {
    apiFailures.push("get profile");
  }

  return apiFailures.join(", ");
};

export const IngressScreen = () => {
  const isMixpanelInitialized = useIOSelector(isMixpanelInitializedSelector);
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector);
  const dispatch = useIODispatch();
  const isConnected = useIOSelector(isConnectedSelector);
  const isOfflineAccessAvailable = useIOSelector(
    itwOfflineAccessAvailableSelector
  );

  const [showBlockingScreen, setShowBlockingScreen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [content, setContent] = useState<{
    title: string;
    subtitle?: string;
  }>({
    title: I18n.t("startup.title")
  });

  useEffect(() => {
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    AccessibilityInfo.announceForAccessibilityWithOptions(content.title, {
      queue: true
    });
  }, [content]);

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
        setContent({
          title: I18n.t("startup.title2"),
          subtitle: I18n.t("startup.subtitle2")
        });
        setShowBanner(true);
        if (isOfflineAccessAvailable) {
          trackSettingsDiscoverBannerVisualized();
        }
        timeouts.shift();
      }, TIMEOUT_CHANGE_LABEL)
    );

    timeouts.push(
      setTimeout(() => {
        dispatch(setIsBlockingScreen());
        setShowBlockingScreen(true);
        timeouts.shift();
      }, TIMEOUT_BLOCKING_SCREEN)
    );

    return () => {
      timeouts?.forEach(clearTimeout);
    };
  }, [dispatch, isOfflineAccessAvailable]);

  const navigateOnOfflineMiniApp = useCallback(
    (offlineReason: OfflineAccessReasonEnum) => {
      dispatch(setOfflineAccessReason(offlineReason));
      dispatch(
        identificationRequest(
          false,
          false,
          undefined,
          undefined,
          {
            onSuccess: () => {
              // This dispatch mounts the new offline navigator.
              // It must be initialized **after** the user completes
              // biometric authentication to prevent graphical glitches.
              dispatch(startupLoadSuccess(StartupStatusEnum.OFFLINE));
            }
          },
          undefined,
          IdentificationBackActionType.CLOSE_APP
        )
      );
    },
    [dispatch]
  );

  useEffect(() => {
    const visualizeOfflineWallet =
      isConnected === false && isOfflineAccessAvailable;

    if (visualizeOfflineWallet) {
      navigateOnOfflineMiniApp(OfflineAccessReasonEnum.DEVICE_OFFLINE);
    }
  }, [
    dispatch,
    isConnected,
    isOfflineAccessAvailable,
    navigateOnOfflineMiniApp
  ]);

  if (isConnected === false && !isOfflineAccessAvailable) {
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
        contentTitle={content.title}
        animatedPictogramSource="waiting"
        banner={{
          showBanner: isOfflineAccessAvailable && showBanner,
          props: {
            pictogramName: "identityCheck",
            color: "neutral",
            title: I18n.t("startup.offline_access_banner.title"),
            content: I18n.t("startup.offline_access_banner.content"),
            action: I18n.t("startup.offline_access_banner.action"),
            onPress: () => {
              trackIngressOfflineWalletBannerCTAClicked();
              navigateOnOfflineMiniApp(OfflineAccessReasonEnum.TIMEOUT);
            }
          }
        }}
      >
        {content.subtitle && (
          <ContentWrapper style={{ alignItems: "center" }}>
            <Body style={{ textAlign: "center" }}>{content.subtitle}</Body>
          </ContentWrapper>
        )}
      </LoadingScreenContent>
    </>
  );
};

const IngressScreenNoInternetConnection = memo(() => {
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector);
  const isMixpanelInitialized = useIOSelector(isMixpanelInitializedSelector);
  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(setIsBlockingScreen());
  });

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
  const isConnected = useIOSelector(isConnectedSelector);
  const profileLoaded = useIOSelector(profileSelector);
  const sessionLoaded = useIOSelector(sessionInfoSelector);
  const hasCheckSessionError = useIOSelector(checkSessionErrorSelector);

  useEffect(() => {
    setAccessibilityFocus(operationRef);
  }, []);

  useEffect(() => {
    // It's not necessary to check if mixpanel is initialized since this screen is shown after 10 seconds.
    // If mixpanel is not initialized at that time, we have an issue spanning, system-wide.
    if (isMixpanelEnabled !== false) {
      if (isBackendStatusLoaded) {
        void trackIngressTimeout(
          getApiFailureValue(
            isConnected,
            sessionLoaded,
            profileLoaded,
            hasCheckSessionError
          )
        );
      } else {
        void trackIngressCdnSystemError();
      }
    }
  }, [
    isBackendStatusLoaded,
    isConnected,
    isMixpanelEnabled,
    profileLoaded,
    sessionLoaded,
    hasCheckSessionError
  ]);

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
