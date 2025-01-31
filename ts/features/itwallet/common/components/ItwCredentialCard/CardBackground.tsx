import { IOColors } from "@pagopa/io-app-design-system";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { AnimatedImage } from "../../../../../components/AnimatedImage";
import { CredentialType } from "../../utils/itwMocksUtils";
import { CardColorScheme } from "./types";

type ItwCredentialCardBackgroundProps = {
  credentialType: string;
  colorScheme: CardColorScheme;
};

export const CardBackground = ({
  credentialType,
  colorScheme
}: ItwCredentialCardBackgroundProps) => {
  const cardBackgroundSource = credentialCardBackgrounds[credentialType];

  return (
    <View style={styles.card}>
      <AnimatedImage
        source={cardBackgroundSource}
        style={styles.cardBackground}
      />
      {colorScheme === "faded" && <View style={styles.cardBackgroundOverlay} />}
    </View>
  );
};

const credentialCardBackgrounds: {
  [type: string]: ImageSourcePropType;
} = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
};

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IOColors["grey-100"]
  },
  cardBackground: { height: "100%", width: "100%" },
  cardBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    backgroundColor: IOColors.white,
    opacity: 0.6,
    zIndex: 10
  }
});
