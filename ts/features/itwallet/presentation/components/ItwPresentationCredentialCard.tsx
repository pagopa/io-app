import {
  ButtonLink,
  IOSpacingScale,
  VStack
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import I18n from "../../../../i18n";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { getCredentialStatus } from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

/**
 * Credentials that should display a skeumorphic card
 */
const credentialsWithSkeumorphicCard: ReadonlyArray<string> = [
  CredentialType.DRIVING_LICENSE
];

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button.
 */
const ItwPresentationCredentialCard = ({ credential }: Props) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const { backgroundColor } = getThemeColorByCredentialType(
    credential.credentialType
  );
  const credentialStatus = getCredentialStatus(credential);

  const hasSkeumorphicCard = credentialsWithSkeumorphicCard.includes(
    credential.credentialType
  );

  if (hasSkeumorphicCard) {
    const flipGesture = Gesture.Fling()
      .direction(Directions.LEFT + Directions.RIGHT)
      .onEnd(() => runOnJS(setIsFlipped)(!isFlipped));

    return (
      <VStack space={8}>
        <GestureDetector gesture={flipGesture}>
          <CardContainer backgroundColor={backgroundColor}>
            <ItwSkeumorphicCard credential={credential} isFlipped={isFlipped} />
          </CardContainer>
        </GestureDetector>
        <View style={styles.flipButton}>
          <ButtonLink
            label={I18n.t(
              "features.itWallet.presentation.credentialDetails.flipCard"
            )}
            onPress={() => setIsFlipped(_ => !_)}
            icon="switchCard"
            iconPosition="end"
          />
        </View>
      </VStack>
    );
  }

  return (
    <CardContainer backgroundColor={backgroundColor}>
      <ItwCredentialCard
        credentialType={credential.credentialType}
        status={credentialStatus}
      />
    </CardContainer>
  );
};

type CardContainerProps = {
  backgroundColor: string;
};

const CardContainer = ({
  children,
  backgroundColor
}: React.PropsWithChildren<CardContainerProps>) => (
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
