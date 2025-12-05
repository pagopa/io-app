import i18n from "i18next";
import { useEffect } from "react";
import { useIOSelector } from "../../../../store/hooks";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { SendAARLoadingComponent } from "../components/SendAARLoadingComponent";
import type { PnParamsList } from "../../navigation/params";
import type { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import PN_ROUTES from "../../navigation/routes";
import {
  SendAARCieCardReadingComponent,
  type SendAARCieCardReadingComponentProps
} from "../components/SendAARCieCardReadingComponent";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

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
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.MESSAGE_DETAILS,
            params: {
              messageId: currentFlow.iun,
              firstTimeOpening: undefined,
              serviceId: currentFlow.pnServiceId,
              sendOpeningSource: "aar",
              sendUserType: "mandatory"
            }
          }
        });
        break;
      }
      case sendAARFlowStates.ko: {
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_ERROR
          }
        });
        break;
      }
    }
  }, [currentFlow, navigation]);

  switch (currentFlow.type) {
    case sendAARFlowStates.cieScanning:
      return <SendAARCieCardReadingComponent {...route.params} />;
    case sendAARFlowStates.validatingMandate:
    case sendAARFlowStates.fetchingNotificationData:
      return (
        <SendAARLoadingComponent
          contentTitle={i18n.t(
            "features.pn.aar.flow.validatingMandate.loadingText"
          )}
        />
      );
    default:
      return null;
  }
};
