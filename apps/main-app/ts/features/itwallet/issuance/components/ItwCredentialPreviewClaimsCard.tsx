import {
  H6,
  IOAccordionRadius,
  IOColors,
  IOSpacingScale,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useCredentialCardConfig } from "../../common/components/ItwCredentialCard/config";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { useItWalletTheme } from "../../common/utils/theme";
import { ItwCredentialPreviewClaimsList } from "./ItwCredentialPreviewClaimsList";

const cardSpacing: IOSpacingScale = 16;

// Border width offset to ensure the header gradient fits within the border curves
const CARD_BORDER = 1;

type Props = {
  /**
   * The credential name displayed in the card header.
   */
  title: string;
  /**
   * The credential whose claims are rendered inside the card.
   */
  data: CredentialMetadata;
};

/**
 * Renders the credential preview claims list inside a bordered card with a
 * static header displaying the credential name over the credential theme gradient.
 */
export const ItwCredentialPreviewClaimsCard = ({ title, data }: Props) => {
  const { theme } = useIOThemeContext();
  const itwTheme = useItWalletTheme();
  const { background } = useCredentialCardConfig(data.credentialType);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: IOColors[theme["appBackground-primary"]],
          borderColor: IOColors[theme["cardBorder-default"]]
        }
      ]}
    >
      <View style={styles.header} accessibilityRole="header">
        <LinearGradient
          colors={[itwTheme["card-background"], background.colors[0]]}
          style={StyleSheet.absoluteFill}
        />
        <H6 style={styles.title}>{title}</H6>
      </View>
      <View style={styles.body}>
        <ItwCredentialPreviewClaimsList data={data} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: IOAccordionRadius,
    borderCurve: "continuous"
  },
  header: {
    padding: cardSpacing,
    borderTopLeftRadius: IOAccordionRadius - CARD_BORDER,
    borderTopRightRadius: IOAccordionRadius - CARD_BORDER,
    overflow: "hidden"
  },
  title: {
    flexShrink: 1
  },
  body: {
    paddingHorizontal: cardSpacing
  }
});
