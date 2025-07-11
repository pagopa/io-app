import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";

export const ThankYouPage = () => (
  <OperationResultScreenContent
    pictogram="doc"
    title={I18n.t("features.pn.qrCodeScan.success.openSendScreen.title")}
    subtitle={I18n.t("features.pn.qrCodeScan.success.openSendScreen.body")}
    action={{
      label: I18n.t("features.pn.qrCodeScan.success.openSendScreen.firstCta"),
      onPress: () => null
    }}
    secondaryAction={{
      label: I18n.t("features.pn.qrCodeScan.success.openSendScreen.secondCta"),
      onPress: () => null
    }}
  />
);
