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
type RouteName = typeof ROUTES.PIN_CONFIRMATION;

/**
 * A screen that allows the user to confirm the unlock code.
 */
const PinConfirmationScreen = ({ navigation }: Props) => {
  const { params } = useRoute<Route<RouteName, PinConfirmationScreenParams>>();
  const { handleSubmit } = useCreatePin();

  return (
    <PinSelectionWrapper navigation={navigation}>
      <PinConfirmation onSubmit={handleSubmit} pin={params.pin} />
    </PinSelectionWrapper>
  );
};

export default PinConfirmationScreen;
