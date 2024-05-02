import * as React from "react";
import { Route, useRoute } from "@react-navigation/native";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import PinSelectionWrapper from "../../components/PinSelectionWrapper";
import { PinConfirmation } from "../../components/PinConfirmation";
import { useCreatePin } from "../../hooks/useCreatePin";
import ROUTES from "../../navigation/routes";
import { PinString } from "../../types/PinString";

export type PinConfirmationScreenParams = { pin: PinString };

type Props = IOStackNavigationRouteProps<AppParamsList>;
type RouteName = typeof ROUTES.ONBOARDING_CONFIRMATION_PIN;
/**
 * A screen that allows the user to confirm the unlock code.
 */
const OnboardingPinConfirmationScreen = ({ navigation }: Props) => {
  const { params } = useRoute<Route<RouteName, PinConfirmationScreenParams>>();
  const { handleSubmit } = useCreatePin({ isOnboarding: true });

  return (
    <PinSelectionWrapper navigation={navigation} isOnboarding>
      <PinConfirmation onSubmit={handleSubmit} pin={params.pin} isOnboarding />
    </PinSelectionWrapper>
  );
};

export default OnboardingPinConfirmationScreen;
