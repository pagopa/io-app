import { ButtonLink } from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { pnMessagingServiceIdSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { useServicePreferenceByChannel } from "../../services/details/hooks/useServicePreference";
import { loadServicePreference } from "../../services/details/store/actions/preference";
import { pnActivationUpsert } from "../store/actions";
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
  const dispatch = useIODispatch();
  const [flowState, setFlowState] = useState<PnBannerFlowStateKey>(
    pnBannerFlowStateEnum.WAITING_USER_INPUT
  );
  useEffect(() => {
    dispatch(loadServicePreference.request(serviceId));
  }, [dispatch, serviceId]);

  // useServicePreferenceByChannel always returns data based on the last loaded service,
  // so it's crucial that the request is always called on first component render, to clear dirty data

  const {
    isErrorServicePreferenceByChannel,
    isLoadingServicePreferenceByChannel,
    servicePreferenceByChannel
  } = useServicePreferenceByChannel("inbox");

  if (isLoadingServicePreferenceByChannel) {
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
      if (servicePreferenceByChannel === true) {
        setFlowState(pnBannerFlowStateEnum.ALREADY_ACTIVE);
      }
      if (isErrorServicePreferenceByChannel) {
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
  if (isLoadingActivation) {
    return <LoadingScreen loadingState="LOADING-ACTIVATION" />;
  }

  const enablePN = () => {
    dispatch(
      pnActivationUpsert.request({
        value: true,
        onSuccess: () => setFlowState(pnBannerFlowStateEnum.SUCCESS_ACTIVATION),
        onFailure: () => setFlowState(pnBannerFlowStateEnum.FAILURE_ACTIVATION)
      })
    );
  };

  return (
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
  );
};

// ---------------------------- COMPONENTS ---------------------------

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
type SuccessFlowStateProps = { flowState: PnBannerFlowStateKey };

type ErrorFlowStateProps = { flowState: PnBannerFlowStateKey | "MISSING-SID" };
type LoadingStateProps = {
  loadingState: "LOADING-ACTIVATION" | "LOADING-DATA";
};
const LoadingScreen = ({ loadingState }: LoadingStateProps) => (
  <Text testID={`loading-${loadingState}`}>LOADING: {loadingState}</Text>
);

const SuccessScreen = ({ flowState }: SuccessFlowStateProps) => {
  const navigation = useIONavigation();
  return (
    <View>
      <Text testID={`success-${flowState}`}>{flowState}</Text>
      <ButtonLink
        onPress={() => navigation.navigate(...navigateHomeParams)}
        label="GO BACK HOME"
      />
    </View>
  );
};
const ErrorScreen = ({ flowState }: ErrorFlowStateProps) => {
  const navigation = useIONavigation();
  return (
    <View>
      <Text testID={`error-${flowState}`}>{flowState}</Text>
      <ButtonLink
        onPress={() => navigation.navigate(...navigateHomeParams)}
        label="GO BACK HOME"
      />
    </View>
  );
};

const navigateHomeParams = [
  ROUTES.MAIN,
  {
    screen: "MESSAGES_HOME"
  }
] as const;
