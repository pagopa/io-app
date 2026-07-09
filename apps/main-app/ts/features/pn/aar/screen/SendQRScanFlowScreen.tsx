import { RouteProp, useRoute } from "@react-navigation/native";
import { useAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";
import { UpdateAppAlert } from "../../../../components/UpdateAppAlert";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { SendQRScanFlowHandlerComponent } from "../components/SendQRScanFlowHandlerComponent";
import { trackSendAarFailure } from "../analytics";

export type SendQRScanFlowScreenProps = {
  aarUrl: string;
};

type RouteProps = RouteProp<PnParamsList, typeof PN_ROUTES.QR_SCAN_FLOW>;

export const SendQRScanFlowScreen = () => {
  const route = useRoute<RouteProps>();
  const { aarUrl } = route.params;
  const requiresUpdate = useAppRequiredUpdate("send");

  if (requiresUpdate) {
    return (
      <UpdateAppAlert
        mixPanelTracking={{
          onLanding: () =>
            trackSendAarFailure(
              "Entry Point",
              "App update required",
              undefined
            ),
          onConfirm: () => undefined
        }}
      />
    );
  }

  return <SendQRScanFlowHandlerComponent aarUrl={aarUrl} />;
};
