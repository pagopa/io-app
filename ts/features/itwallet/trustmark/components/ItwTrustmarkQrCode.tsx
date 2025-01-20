import {
  Body,
  ButtonLink,
  Icon,
  IOColors,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
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

  const content = useMemo(() => {
    if (failure) {
      return (
        <View style={styles.alert}>
          <Icon name="noticeFilled" size={24} color="grey-700" />
          <Body textStyle={{ textAlign: "center" }}>
            {I18n.t("features.itWallet.trustmark.failure.description")}
          </Body>
          <View>
            <ButtonLink
              label={I18n.t("features.itWallet.trustmark.failure.action")}
              onPress={handleOnRetry}
            />
          </View>
        </View>
      );
    }

    return (
      <QrCodeImage
        size={"92%"}
        value={trustmarkUrl}
        correctionLevel="L"
        accessibilityLabel={I18n.t("features.itWallet.trustmark.qrCode")}
      />
    );
  }, [failure, trustmarkUrl, handleOnRetry]);

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    alignItems: "center"
  },
  alert: {
    backgroundColor: IOColors["grey-50"],
    width: "92%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    padding: 16,
    borderRadius: 16,
    gap: 8
  }
});

export { ItwTrustmarkQrCode };
