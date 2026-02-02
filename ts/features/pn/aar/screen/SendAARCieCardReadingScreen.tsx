import i18n from "i18next";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import type { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import type { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import {
  SendAARCieCardReadingComponent,
  type SendAARCieCardReadingComponentProps
} from "../components/SendAARCieCardReadingComponent";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export type SendAARCieCardReadingScreenRouteParams =
  Readonly<SendAARCieCardReadingComponentProps>;

export type SendAARCieCardReadingScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_CIE_CARD_READING
>;

export const SendAARCieCardReadingScreen = ({
  route,
  navigation
}: SendAARCieCardReadingScreenProps) => {
  const currentFlow = useIOSelector(currentAARFlowData);

  useEffect(() => {
    switch (currentFlow.type) {
      case sendAARFlowStates.displayingNotificationData: {
        navigation.replace(PN_ROUTES.MESSAGE_DETAILS, {
          messageId: currentFlow.iun,
          firstTimeOpening: undefined,
          serviceId: currentFlow.pnServiceId,
          sendOpeningSource: "aar",
          sendUserType: "mandatory"
        });
        break;
      }
      case sendAARFlowStates.ko: {
        navigation.replace(PN_ROUTES.SEND_AAR_ERROR);
        break;
      }
    }
  }, [currentFlow, navigation]);

  useHardwareBackButtonWhenFocused(() => true);

  switch (currentFlow.type) {
    case sendAARFlowStates.cieScanning:
      return <SendAARCieCardReadingComponent {...route.params} />;
    case sendAARFlowStates.validatingMandate:
    case sendAARFlowStates.fetchingNotificationData:
      return (
        <LoadingScreenContent
          testID="LoadingScreenContent"
          title={i18n.t("features.pn.aar.flow.validatingMandate.loadingText")}
        />
      );
    default:
      return null;
  }
};
