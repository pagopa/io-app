import i18n from "i18next";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import type { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import type { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import {
  SendAARCieCardReadingComponent,
  type SendAARCieCardReadingComponentProps
} from "../components/SendAARCieCardReadingComponent";
import { currentAARFlowStateType } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export type SendAARCieCardReadingScreenRouteParams =
  Readonly<SendAARCieCardReadingComponentProps>;

type SendAARCieCardReadingScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_CIE_CARD_READING
>;

export const SendAARCieCardReadingScreen = ({
  route
}: SendAARCieCardReadingScreenProps) => {
  const currentFlow = useIOSelector(currentAARFlowStateType);

  switch (currentFlow) {
    case sendAARFlowStates.cieScanning:
      return <SendAARCieCardReadingComponent {...route.params} />;
    case sendAARFlowStates.validatingMandate:
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
