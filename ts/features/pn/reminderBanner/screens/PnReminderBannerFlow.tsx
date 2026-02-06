import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useState } from "react";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { sendBannerMixpanelEvents } from "../../analytics/activationReminderBanner";
import { usePnPreferencesFetcher } from "../../hooks/usePnPreferencesFetcher";
import { pnActivationUpsert } from "../../store/actions";
import { isLoadingPnActivationSelector } from "../../store/reducers/activation";
import { PnBannerFlowComponents } from "../components/PnBannerFlowComponents";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

export const pnBannerFlowStateEnum = {
  FAILURE_DETAILS_FETCH: "FAILURE_DETAILS_FETCH",
  FAILURE_ACTIVATION: "FAILURE_ACTIVATION",
  WAITING_USER_INPUT: "WAITING_USER_INPUT",
  SUCCESS_ACTIVATION: "SUCCESS_ACTIVATION",
  ALREADY_ACTIVE: "ALREADY_ACTIVE"
} as const;
type FlowEnumT = typeof pnBannerFlowStateEnum;

const { CtaScreen, ErrorScreen, LoadingScreen, SuccessScreen } =
  PnBannerFlowComponents;
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
        goBack={() =>
          navigation.navigate(ROUTES.MAIN, { screen: "MESSAGES_HOME" })
        }
        backAccessibilityLabel={I18n.t("accessibility.buttons.navigateBack")}
      />
      <CtaScreen
        scrollViewAction={{
          primary: {
            label: I18n.t(
              "features.pn.reminderBanner.activationFlow.WAITING_USER_INPUT.CTA"
            ),
            onPress: enablePN,
            testID: "enable-pn-cta"
          },
          type: "SingleButton"
        }}
      />
    </>
  );
};
