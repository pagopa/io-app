import { RouteProp, useRoute } from "@react-navigation/native";
import { SendQrScanRedirectScreen } from "../components/SendQrScanRedirectScreen";
import {
  PN_QR_SCAN_ROUTES,
  PnQrCodeScanParamList
} from "../navigation/navigator";

export type SendQRScanFlowProps = {
  aarUrl: string;
};

type RouteProps = RouteProp<
  PnQrCodeScanParamList,
  typeof PN_QR_SCAN_ROUTES.QR_SCAN_FLOW
>;

export const SendQrScanFlow = () => {
  const route = useRoute<RouteProps>();
  const { aarUrl } = route.params;

  return <SendQrScanRedirectScreen aarUrl={aarUrl} />;
};
