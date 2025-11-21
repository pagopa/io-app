import i18n from "i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIOSelector } from "../../../../store/hooks";
import { currentAARFlowStateType } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { SendAARLoadingComponent } from "../components/SendAARLoadingComponent";
import type { PnParamsList } from "../../navigation/params";
import type { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import PN_ROUTES from "../../navigation/routes";
import {
  SendAARCieCardReadingComponent,
  type SendAARCieCardReadingComponentProps
} from "../components/SendAARCieCardReadingComponent";

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

  const isCieScanningFlow = currentFlow === sendAARFlowStates.cieScanning;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isCieScanningFlow ? (
        <SendAARCieCardReadingComponent {...route.params} />
      ) : (
        <SendAARLoadingComponent
          contentTitle={i18n.t(
            "features.pn.aar.flow.validatingMandate.loadingText"
          )}
        />
      )}
    </SafeAreaView>
  );
};
