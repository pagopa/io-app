import { RouteProp, useRoute } from "@react-navigation/native";
import { withAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { SendQRScanFlowHandlerComponent } from "../components/SendQRScanFlowHandlerComponent";
import { trackSendAARFailure } from "../analytics";

export type SendQRScanFlowScreenProps = {
  aarUrl: string;
};

type RouteProps = RouteProp<PnParamsList, typeof PN_ROUTES.QR_SCAN_FLOW>;

export const SendQRScanFlowScreen = () => {
  const route = useRoute<RouteProps>();
  const { aarUrl } = route.params;

  const SendQRScanRedirectScreenWithUpdate = withAppRequiredUpdate(
    SendQRScanFlowHandlerComponent,
    "send",
    {
      onLanding: () =>
        trackSendAARFailure("Entry Point", "App update required"),
      onConfirm: () => undefined
    }
  );
  return <SendQRScanRedirectScreenWithUpdate aarUrl={aarUrl} />;
};
