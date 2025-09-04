/* eslint-disable functional/immutable-data */
/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { voidType } from "io-ts";
import { memo, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import ModalSectionStatusComponent from "../../../../components/SectionStatus/modal";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isBackendStatusLoadedSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { trackIngressServicesSlowDown } from "../../../ingress/analytics";
import { setIsBlockingScreen } from "../../../ingress/store/actions";
import { IdPayOnboardingMachineContext } from "../machine/provider";

const TIMEOUT_CHANGE_LABEL = (5 * 1000) as Millisecond;
const TIMEOUT_BLOCKING_SCREEN = (10 * 1000) as Millisecond;

export const IdPayFailToRetryScreen = () => {
  const dispatch = useIODispatch();
  const isConnected = useIOSelector(isConnectedSelector);

  const [showBlockingScreen, setShowBlockingScreen] = useState(false);
  const [contentTitle, setContentTitle] = useState(
    I18n.t("idpay.onboarding.failToRetry.contentTitle")
  );

  useEffect(() => {
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    AccessibilityInfo.announceForAccessibilityWithOptions(contentTitle, {
      queue: true
    });
  }, [contentTitle]);

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

  if (isConnected === false) {
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
        animatedPictogramSource="waiting"
      />
    </>
  );
};

const IngressScreenNoInternetConnection = memo(() => (
  <OperationResultScreenContent
    testID="device-connection-lost-id"
    pictogram="lostConnection"
    title={I18n.t("startup.connection_lost.title")}
    subtitle={I18n.t("startup.connection_lost.description")}
  />
));

const IngressScreenBlockingError = memo(() => {
  const operationRef = useRef<View>(null);
  const isBackendStatusLoaded = useIOSelector(isBackendStatusLoadedSelector);
  const { useActorRef } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  useEffect(() => {
    setAccessibilityFocus(operationRef);
  }, []);

  return (
    <OperationResultScreenContent
      ref={operationRef}
      testID="device-blocking-screen-id"
      {...(isBackendStatusLoaded
        ? {
            pictogram: "time",
            title: I18n.t("startup.slowdowns_results_screen.title"),
            subtitle: I18n.t("startup.slowdowns_results_screen.subtitle"),
            action: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machine.send({ type: "close" })
            },
            secondaryAction: {
              label: I18n.t("global.buttons.visitWebsite"),
              onPress: () => voidType
            }
          }
        : {
            pictogram: "umbrella",
            title: I18n.t("startup.cdn_unreachable_results_screen.title"),
            subtitle: I18n.t("startup.cdn_unreachable_results_screen.subtitle")
          })}
    />
  );
});
