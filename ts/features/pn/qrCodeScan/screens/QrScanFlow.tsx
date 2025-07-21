import { useCallback, useEffect } from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SendQrScanRedirectComponent } from "../components/SendQrScanRedirectComponent";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { withAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";

export type SendQRScanFlowProps = {
  aarUrl: string;
};

type RouteProps = RouteProp<PnParamsList, typeof PN_ROUTES.QR_SCAN_FLOW>;

export const SendQrScanFlow = () => {
  const route = useRoute<RouteProps>();
  const { aarUrl } = route.params;

  const navigation = useIONavigation();

  const handleCloseScreen = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "closeMedium",
            onPress: handleCloseScreen,
            accessibilityLabel: I18n.t("global.buttons.close"),
            testID: "header-close"
          }}
        />
      )
    });
  }, [handleCloseScreen, navigation]);

  const SendQrScanRedirectScreenWithUpdate = withAppRequiredUpdate(
    SendQrScanRedirectComponent,
    "send"
  );
  return <SendQrScanRedirectScreenWithUpdate aarUrl={aarUrl} />;
};
