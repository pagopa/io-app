import { IOVisualCostants } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { ItwRetryableQRCode } from "../../common/components/ItwRetryableQRCode";
import { ItwTrustmarkMachineContext } from "../machine/provider";
import { selectFailure, selectTrustmarkUrl } from "../machine/selectors";

/**
 * Component that renders the QR code of the trustmark
 */
const ItwTrustmarkQrCode = () => {
  const machineRef = ItwTrustmarkMachineContext.useActorRef();
  const trustmarkUrl =
    ItwTrustmarkMachineContext.useSelector(selectTrustmarkUrl);
  const failure = ItwTrustmarkMachineContext.useSelector(selectFailure);

  useDebugInfo({ trustmarkUrl, failure });

  const handleOnRetry = useCallback(() => {
    machineRef.send({ type: "retry" });
  }, [machineRef]);

  return (
    <View style={styles.container}>
      <ItwRetryableQRCode
        accessibilityLabel={I18n.t("features.itWallet.trustmark.qrCode")}
        correctionLevel="L"
        onRetry={handleOnRetry}
        retryDescription={I18n.t(
          "features.itWallet.trustmark.failure.description"
        )}
        retryLabel={I18n.t("features.itWallet.trustmark.failure.action")}
        shouldRetry={!!failure}
        size="92%"
        value={trustmarkUrl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    alignItems: "center"
  }
});

export { ItwTrustmarkQrCode };
