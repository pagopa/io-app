import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useState } from "react";
import { Text } from "react-native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../components/ui/IOScrollView";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { pnMessagingServiceIdSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import LoadingComponent from "../../fci/components/LoadingComponent";
import { sendBannerMixpanelEvents } from "../analytics/activationReminderBanner";
import { usePnPreferencesFetcher } from "../hooks/usePnPreferencesFetcher";
import {
  dismissPnActivationReminderBanner,
  pnActivationUpsert
} from "../store/actions";
import { isLoadingPnActivationSelector } from "../store/reducers/activation";

export const pnBannerFlowStateEnum = {
  FAILURE_DETAILS_FETCH: "FAILURE_DETAILS_FETCH",
  FAILURE_ACTIVATION: "FAILURE_ACTIVATION",
  WAITING_USER_INPUT: "WAITING_USER_INPUT",
  SUCCESS_ACTIVATION: "SUCCESS_ACTIVATION",
  ALREADY_ACTIVE: "ALREADY_ACTIVE"
} as const;
type FlowEnumT = typeof pnBannerFlowStateEnum;
export type PnBannerFlowStateKey = FlowEnumT[keyof FlowEnumT];
export const PNActivationBannerFlowScreen = () => {
  const pnServiceId = useIOSelector(pnMessagingServiceIdSelector);

  if (pnServiceId === undefined) {
    return <ErrorScreen flowState="MISSING-SID" />; // UI WISE: "COULD NOT FETCH"
  }

  return <PNFlowScreenPicker serviceId={pnServiceId} />;
};

const PNFlowScreenPicker = ({ serviceId }: { serviceId: ServiceId }) => {
  const [flowState, setFlowState] = useState<PnBannerFlowStateKey>(
    pnBannerFlowStateEnum.WAITING_USER_INPUT
  );

  const { isError, isLoading, isEnabled } = usePnPreferencesFetcher(serviceId);

  if (isLoading) {
    return <LoadingScreen loadingState="LOADING-DATA" />;
  }

  switch (flowState) {
    case pnBannerFlowStateEnum.FAILURE_ACTIVATION:
    case pnBannerFlowStateEnum.FAILURE_DETAILS_FETCH:
      return <ErrorScreen flowState={flowState} />;

    case pnBannerFlowStateEnum.ALREADY_ACTIVE:
    case pnBannerFlowStateEnum.SUCCESS_ACTIVATION:
      return <SuccessScreen flowState={flowState} />;
    case pnBannerFlowStateEnum.WAITING_USER_INPUT:
      if (isEnabled) {
        setFlowState(pnBannerFlowStateEnum.ALREADY_ACTIVE);
      }
      if (isError) {
        setFlowState(pnBannerFlowStateEnum.FAILURE_DETAILS_FETCH);
      }
      return <PnActivationInputScreen setFlowState={setFlowState} />;
  }
};

type FlowScreenProps = {
  setFlowState: (state: PnBannerFlowStateKey) => void;
};

const PnActivationInputScreen = ({ setFlowState }: FlowScreenProps) => {
  const dispatch = useIODispatch();
  const isLoadingActivation = useIOSelector(isLoadingPnActivationSelector);
  const navigation = useIONavigation();
  if (isLoadingActivation) {
    return <LoadingScreen loadingState="LOADING-ACTIVATION" />;
  }

  const enablePN = () => {
    sendBannerMixpanelEvents.activationStart();
    dispatch(
      pnActivationUpsert.request({
        value: true,
        onSuccess: () => setFlowState(pnBannerFlowStateEnum.SUCCESS_ACTIVATION),
        onFailure: () => setFlowState(pnBannerFlowStateEnum.FAILURE_ACTIVATION)
      })
    );
  };

  return (
    <>
      <HeaderSecondLevel
        title=""
        type="base"
        goBack={() => navigation.navigate(...navigateHomeParams)}
        backAccessibilityLabel={I18n.t("accessibility.buttons.navigateBack")}
      />
      <CtaScreen
        scrollViewAction={{
          primary: {
            label: "ACTIVATE",
            onPress: enablePN,
            testID: "enable-pn-cta"
          },
          type: "SingleButton"
        }}
      />
    </>
  );
};

// ---------------------------- COMPONENT TYPES ---------------------------

type SuccessFlowStateKeys = Extract<
  PnBannerFlowStateKey,
  "SUCCESS_ACTIVATION" | "ALREADY_ACTIVE"
>;
type SuccessFlowStateProps = { flowState: SuccessFlowStateKeys };

type ErrorFlowStateKeys =
  | Extract<
      PnBannerFlowStateKey,
      "FAILURE_ACTIVATION" | "FAILURE_DETAILS_FETCH"
    >
  | "MISSING-SID";
type ErrorFlowStateProps = {
  flowState: ErrorFlowStateKeys;
};
type LoadingStateProps = {
  loadingState: "LOADING-ACTIVATION" | "LOADING-DATA";
};

// ---------------------------- COMPONENTS ---------------------------

const LoadingScreen = ({ loadingState }: LoadingStateProps) => (
  <LoadingComponent
    testID={`loading-${loadingState}`}
    captionTitle={I18n.t(
      `features.pn.reminderBanner.activationFlow.${loadingState}.title`
    )}
  />
);

const SuccessScreen = ({ flowState }: SuccessFlowStateProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  useOnFirstRender(() => {
    dispatch(dismissPnActivationReminderBanner());
  });

  if (flowState === "ALREADY_ACTIVE") {
    sendBannerMixpanelEvents.alreadyActive();
  }
  if (flowState === "SUCCESS_ACTIVATION") {
    sendBannerMixpanelEvents.activationSuccess();
  }

  return (
    <OperationResultScreenContent
      testID={`success-${flowState}`}
      title={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.title`
      )}
      subtitle={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.body`
      )}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.navigate(...navigateHomeParams)
      }}
      pictogram="success"
    />
  );
};
const ErrorScreen = ({ flowState }: ErrorFlowStateProps) => {
  sendBannerMixpanelEvents.bannerKO(flowState);
  const navigation = useIONavigation();
  return (
    <OperationResultScreenContent
      testID={`error-${flowState}`}
      title={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.title`
      )}
      subtitle={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.body`
      )}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.navigate(...navigateHomeParams)
      }}
      pictogram="umbrella"
    />
  );
};

const CtaScreen = ({
  scrollViewAction
}: {
  scrollViewAction: IOScrollViewActions;
}) => (
  <IOScrollView actions={scrollViewAction}>
    <Text testID={`cta-${pnBannerFlowStateEnum.WAITING_USER_INPUT}`}>
      Tap the below button to enable PN
    </Text>
  </IOScrollView>
);

const navigateHomeParams = [
  ROUTES.MAIN,
  {
    screen: "MESSAGES_HOME"
  }
] as const;
