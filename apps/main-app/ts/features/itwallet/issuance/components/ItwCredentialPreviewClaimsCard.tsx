import { IOSpacingScale } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { ItwCredentialClaimsCard } from "../../common/components/ItwCredentialClaimsCard";
import { useCredentialCardConfig } from "../../common/components/ItwCredentialCard/config";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { ItwCredentialPreviewClaimsList } from "./ItwCredentialPreviewClaimsList";

const cardSpacing: IOSpacingScale = 16;

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
  const { background } = useCredentialCardConfig(data.credentialType);

  return (
    <ItwCredentialClaimsCard
      title={title}
      headerGradientColor={background.colors[0]}
    >
      <View style={styles.body}>
        <ItwCredentialPreviewClaimsList data={data} />
      </View>
    </ItwCredentialClaimsCard>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: cardSpacing
  }
});
