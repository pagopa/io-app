import { RouteProp, useRoute } from "@react-navigation/native";
import { SendQrScanRedirectScreen } from "../components/SendQrScanRedirectScreen";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";

export type SendQRScanFlowProps = {
  aarUrl: string;
};

type RouteProps = RouteProp<PnParamsList, typeof PN_ROUTES.QR_SCAN_FLOW>;

export const SendQrScanFlow = () => {
  const route = useRoute<RouteProps>();
  const { aarUrl } = route.params;

  return <SendQrScanRedirectScreen aarUrl={aarUrl} />;
};
