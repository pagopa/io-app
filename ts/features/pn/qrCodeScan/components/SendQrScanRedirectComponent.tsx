import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

export type SendQRScanRedirectComponentProps = {
  aarUrl: string;
};
export const SendQrScanRedirectComponent = ({
  aarUrl
}: SendQRScanRedirectComponentProps) => {
  const handleOpenSendScreen = () => {
    openWebUrl(aarUrl);
  };

  return (
    <OperationResultScreenContent
      isHeaderVisible
      pictogram="sendAccess"
      title={I18n.t("features.pn.qrCodeScan.success.openSendScreen.title")}
      action={{
        label: I18n.t("features.pn.qrCodeScan.success.openSendScreen.firstCta"),
        onPress: handleOpenSendScreen,
        testID: "primary-action"
      }}
    />
  );
};
