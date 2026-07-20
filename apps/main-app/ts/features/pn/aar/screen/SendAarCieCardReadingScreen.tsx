import i18n from "i18next";
import { useEffect } from "react";

import type { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import type { PnParamsList } from "../../navigation/params";

import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import { useIOSelector } from "../../../../store/hooks";
import PN_ROUTES from "../../navigation/routes";
import {
  SendAarCieCardReadingComponent,
  type SendAarCieCardReadingComponentProps
} from "../components/SendAarCieCardReadingComponent";
import { currentAarFlowData } from "../store/selectors";
import { sendAarFlowStates } from "../utils/stateUtils";

export type SendAarCieCardReadingScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_CIE_CARD_READING
>;

export type SendAarCieCardReadingScreenRouteParams =
  Readonly<SendAarCieCardReadingComponentProps>;

export const SendAarCieCardReadingScreen = ({
  route,
  navigation
}: SendAarCieCardReadingScreenProps) => {
  const currentFlow = useIOSelector(currentAarFlowData);

  useEffect(() => {
    switch (currentFlow.type) {
      case sendAarFlowStates.cieCanAdvisory: {
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL, {
          animationTypeForReplace: "pop"
        });
        break;
      }
      case sendAarFlowStates.cieScanningAdvisory: {
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL, {
          animationTypeForReplace: "pop"
        });
        break;
      }
      case sendAarFlowStates.displayingNotificationData: {
        navigation.replace(PN_ROUTES.MESSAGE_DETAILS, {
          messageId: currentFlow.iun,
          firstTimeOpening: undefined,
          serviceId: currentFlow.pnServiceId,
          sendOpeningSource: "aar",
          sendUserType: "mandatory"
        });
        break;
      }
      case sendAarFlowStates.ko: {
        navigation.replace(PN_ROUTES.SEND_AAR_ERROR);
        break;
      }
    }
  }, [currentFlow, navigation]);

  useHardwareBackButtonWhenFocused(() => true);

  switch (currentFlow.type) {
    case sendAarFlowStates.cieScanning:
      return <SendAarCieCardReadingComponent {...route.params} />;
    case sendAarFlowStates.fetchingNotificationData:
    case sendAarFlowStates.validatingMandate:
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
