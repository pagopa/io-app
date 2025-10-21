/* eslint-disable functional/immutable-data */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { memo, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import ModalSectionStatusComponent from "../../../../components/SectionStatus/modal";
import { useIODispatch } from "../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackIngressServicesSlowDown } from "../../../ingress/analytics";
import { setIsBlockingScreen } from "../../../ingress/store/actions";
import {
  trackIDPayIngressScreenCTA,
  trackIDPayIngressScreenLoading,
  trackIDPayIngressScreenTimeout
} from "../analytics";
import { IdPayOnboardingMachineContext } from "../machine/provider";

const TIMEOUT_CHANGE_LABEL = (5 * 1000) as Millisecond;
const TIMEOUT_BLOCKING_SCREEN = (10 * 1000) as Millisecond;

export const IdPayFailToRetryScreen = () => {
  const dispatch = useIODispatch();

  const [showBlockingScreen, setShowBlockingScreen] = useState(false);
  const [contentTitle, setContentTitle] = useState(
    I18n.t("idpay.onboarding.failToRetry.contentTitle")
  );
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const initiative = useSelector(state => state.context.initiative);
  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  const state = useSelector(state => state);

  const isFirstCallInPending =
    state.hasTag("loading") || state.children.getRequiredCriteria !== undefined;

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
        machine.send({ type: "retryConnection" });
        setContentTitle(I18n.t("startup.title2"));
        timeouts.shift();
      }, TIMEOUT_CHANGE_LABEL)
    );
    timeouts.push(
      setTimeout(() => {
        // if first call is still pending, do not send another retry event
        if (!isFirstCallInPending) {
          machine.send({ type: "retryConnection" });
        }
        setShowBlockingScreen(true);
        dispatch(setIsBlockingScreen());
        timeouts.shift();
      }, TIMEOUT_BLOCKING_SCREEN)
    );

    return () => {
      timeouts?.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, machine]);

  useOnFirstRender(() =>
    trackIDPayIngressScreenLoading({
      initiativeId,
      initiativeName
    })
  );

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

const IngressScreenBlockingError = memo(() => {
  const operationRef = useRef<View>(null);
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const initiative = useSelector(state => state.context.initiative);

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  useEffect(() => {
    setAccessibilityFocus(operationRef);
  }, []);

  useOnFirstRender(() =>
    trackIDPayIngressScreenTimeout({
      initiativeId,
      initiativeName
    })
  );

  return (
    <OperationResultScreenContent
      ref={operationRef}
      testID="device-blocking-screen-id"
      pictogram="time"
      title={I18n.t("startup.slowdowns_results_screen.title")}
      subtitle={I18n.t("idpay.onboarding.failToRetry.subtitle")}
      action={{
        label: I18n.t("global.buttons.back"),
        onPress: () => machine.send({ type: "close" })
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.visitWebsite"),
        onPress: () => {
          trackIDPayIngressScreenCTA({
            initiativeId,
            initiativeName
          });
        }
      }}
    />
  );
});
