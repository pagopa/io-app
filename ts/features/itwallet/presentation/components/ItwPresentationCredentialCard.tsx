import {
  ButtonLink,
  IOSpacingScale,
  VStack
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { getCredentialExpireStatus } from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button.
 */
const ItwPresentationCredentialCard = ({ credential }: Props) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const themeColor = getThemeColorByCredentialType(
    credential.credentialType as CredentialType
  );

  const credentialStatus = getCredentialExpireStatus(
    credential.parsedCredential
  );

  const hasSkeumorphicCard =
    credential.credentialType === CredentialType.DRIVING_LICENSE;

  if (hasSkeumorphicCard) {
    return (
      <VStack space={8}>
        <Wrapper backgroundColor={themeColor}>
          <ItwSkeumorphicCard credential={credential} isFlipped={isFlipped} />
        </Wrapper>
        <View style={styles.flipButton}>
          <ButtonLink
            label={I18n.t("features.itWallet.presentation.credentialDetails.flipCard")}
            onPress={() => setIsFlipped(_ => !_)}
            icon="switchCard"
            iconPosition="end"
          />
        </View>
      </VStack>
    );
  }

  return (
    <Wrapper backgroundColor={themeColor}>
      <ItwCredentialCard
        credentialType={credential.credentialType}
        status={credentialStatus}
      />
    </Wrapper>
  );
};

type WrapperProps = {
  children: React.ReactNode;
  backgroundColor: string;
};

const Wrapper = ({ children, backgroundColor }: WrapperProps) => (
  <View style={styles.cardContainer}>
    {children}
    <View style={[styles.cardBackdrop, { backgroundColor }]} />
  </View>
);

const cardPaddingHorizontal: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    paddingHorizontal: cardPaddingHorizontal
  },
  cardBackdrop: {
    height: "200%", // Twice the card in order to avoid the white background when the scrollview bounces
    position: "absolute",
    top: "-130%", // Offset by the card height + a 30%
    right: 0,
    left: 0,
    zIndex: -1
  },
  flipButton: {
    alignSelf: "center"
  }
});

export { ItwPresentationCredentialCard };
