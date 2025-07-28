import { useCallback, useEffect } from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { openWebUrl } from "../../../../utils/url";

export type SendQRScanRedirectComponentProps = {
  aarUrl: string;
};
export const SendQRScanRedirectComponent = ({
  aarUrl
}: SendQRScanRedirectComponentProps) => {
  const navigation = useIONavigation();

  const handleOpenSendScreen = () => {
    openWebUrl(aarUrl);
  };

  const handleCloseScreen = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
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
