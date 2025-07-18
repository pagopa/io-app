import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import ROUTES from "../../../../navigation/routes";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export type SendQRScanRedirectScreenProps = {
  aarUrl: string;
};
export const SendQrScanRedirectScreen = ({
  aarUrl
}: SendQRScanRedirectScreenProps) => {
  const navigation = useIONavigation();

  const handleOpenSendScreen = () => {
    openWebUrl(aarUrl);
  };
  const handleCloseScreen = () => {
    navigation.navigate(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  };

  return (
    <OperationResultScreenContent
      pictogram="doc"
      title={I18n.t("features.pn.qrCodeScan.success.openSendScreen.title")}
      subtitle={I18n.t("features.pn.qrCodeScan.success.openSendScreen.body")}
      action={{
        label: I18n.t("features.pn.qrCodeScan.success.openSendScreen.firstCta"),
        onPress: handleOpenSendScreen,
        testID: "primary-action"
      }}
      secondaryAction={{
        label: I18n.t(
          "features.pn.qrCodeScan.success.openSendScreen.secondCta"
        ),
        onPress: handleCloseScreen,
        testID: "secondary-action"
      }}
    />
  );
};
