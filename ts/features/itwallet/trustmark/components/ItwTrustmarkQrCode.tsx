import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { ItwTrustmarkMachineContext } from "../machine/provider";
import { selectFailure, selectTrustmarkUrl } from "../machine/selectors";
import { ItwRetryableQRCode } from "../../common/components/ItwRetryableQRCode";

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
        shouldRetry={!!failure}
        size="92%"
        value={trustmarkUrl}
        correctionLevel="L"
        accessibilityLabel={I18n.t("features.itWallet.trustmark.qrCode")}
        retryDescription={I18n.t(
          "features.itWallet.trustmark.failure.description"
        )}
        retryLabel={I18n.t("features.itWallet.trustmark.failure.action")}
        onRetry={handleOnRetry}
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
