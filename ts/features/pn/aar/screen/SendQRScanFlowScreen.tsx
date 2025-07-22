import { RouteProp, useRoute } from "@react-navigation/native";
import { SendQRScanRedirectComponent } from "../components/SendQRScanRedirectComponent";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { withAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";

export type SendQRScanFlowScreenProps = {
  aarUrl: string;
};

type RouteProps = RouteProp<PnParamsList, typeof PN_ROUTES.QR_SCAN_FLOW>;

export const SendQRScanFlowScreen = () => {
  const route = useRoute<RouteProps>();
  const { aarUrl } = route.params;

  const SendQRScanRedirectScreenWithUpdate = withAppRequiredUpdate(
    SendQRScanRedirectComponent,
    "send"
  );
  return <SendQRScanRedirectScreenWithUpdate aarUrl={aarUrl} />;
};
