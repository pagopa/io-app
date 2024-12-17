import { IOSpacingScale, VStack } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { CREDENTIALS_MAP, trackWalletShowBack } from "../../analytics";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../common/components/ItwSkeumorphicCard/FlipGestureDetector";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialStatusSelector } from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwPresentationCredentialCardFlipButton } from "./ItwPresentationCredentialCardFlipButton";

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button.
 */
const ItwPresentationCredentialCard = ({ credential }: Props) => {
  const navigation = useIONavigation();
  const [isFlipped, setIsFlipped] = React.useState(false);

  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  const handleFlipButtonPress = React.useCallback(() => {
    trackWalletShowBack(CREDENTIALS_MAP[credential.credentialType]);
    setIsFlipped(_ => !_);
  }, [credential.credentialType]);

  const handleCardPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
      params: {
        credential,
        status
      }
    });
  };

  const { backgroundColor } = getThemeColorByCredentialType(
    credential.credentialType
  );

  return (
    <VStack space={8}>
      <CardContainer backgroundColor={backgroundColor}>
        <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setIsFlipped}>
          <ItwSkeumorphicCard
            credential={credential}
            isFlipped={isFlipped}
            status={status}
            onPress={handleCardPress}
          />
        </FlipGestureDetector>
      </CardContainer>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={handleFlipButtonPress}
      />
    </VStack>
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
    paddingHorizontal: cardPaddingHorizontal,
    paddingTop: 8 // Add top padding to prevent card clipping during flip animation
  },
  cardBackdrop: {
    height: "200%", // Twice the card in order to avoid the white background when the scrollview bounces
    position: "absolute",
    top: "-130%", // Offset by the card height + a 30%
    right: 0,
    left: 0,
    zIndex: -1
  }
});

export { ItwPresentationCredentialCard };
