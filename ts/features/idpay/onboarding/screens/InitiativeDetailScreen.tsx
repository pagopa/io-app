import React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActor } from "@xstate/react";
import { IDPayOnboardingParamsList } from "../navigation/navigator";
import { useOnboardingMachineService } from "../xstate/provider";

type InitiativeDetailsScreenRouteParams = {
  serviceId: string;
};

const InitiativeDetailsScreen = () => {
  const onboardingMachineService = useOnboardingMachineService();

  const [state, send] = useActor(onboardingMachineService);

  const route =
    useRoute<
      RouteProp<
        IDPayOnboardingParamsList,
        "IDPAY_ONBOARDING_INITIATIVE_DETAILS"
      >
    >();

  const { serviceId } = route.params;

  React.useEffect(() => {
    send({
      type: "SELECT_INITIATIVE",
      serviceId
    });
  }, [send, serviceId]);

  const content = React.useMemo(() => {
    if (
      state.matches("WAITING_INITIATIVE_SELECTION") ||
      state.matches("LOADING_INITIATIVE")
    ) {
      return <Text>Loading...</Text>;
    }

    if (
      state.matches("DISPLAYING_INITIATIVE") &&
      state.context.initative !== undefined
    ) {
      return <Text>Initiative ID: {state.context.initative.initiativeId}</Text>;
    }

    return null;
  }, [state]);

  return (
    <SafeAreaView>
      <Text>ServiceID: {serviceId}</Text>
      <Text>State: {state.value}</Text>
      {content}
    </SafeAreaView>
  );
};

export type { InitiativeDetailsScreenRouteParams };

export default InitiativeDetailsScreen;
