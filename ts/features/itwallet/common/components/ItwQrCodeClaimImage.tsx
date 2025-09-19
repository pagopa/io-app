import { Appearance, StyleSheet, View } from "react-native";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { ClaimDisplayFormat } from "../utils/itwClaimsUtils";

type ItwQrCodeClaimImageProps = {
  claim: ClaimDisplayFormat;
};

/**
 * This component allows to render the content of a claim in form of a QR Code
 */
export const ItwQrCodeClaimImage = ({ claim }: ItwQrCodeClaimImageProps) => {
  if (claim.value === undefined || typeof claim.value !== "string") {
    return null;
  }
  const colorScheme = Appearance.getColorScheme();

  return (
    <View style={styles.qrCode}>
      <QrCodeImage
        value={claim.value}
        size={230}
        inverted={colorScheme === "dark"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  qrCode: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24
  }
});
