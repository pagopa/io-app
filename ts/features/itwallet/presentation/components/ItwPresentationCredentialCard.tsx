import { IOSpacingScale, VStack } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useIOSelector } from "../../../../store/hooks";
import { CREDENTIALS_MAP, trackWalletShowBack } from "../../analytics";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialStatusSelector } from "../../credentials/store/selectors";
import { useCredentialFullScreenCardModal } from "../hooks/useCredentialFullScreenCardModal";
import { ItwPresentationCredentialCardFlipButton } from "./ItwPresentationCredentialCardFlipButton";

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button.
 */
const ItwPresentationCredentialCard = ({ credential }: Props) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  const fullScreenCardModal = useCredentialFullScreenCardModal({
    credential,
    status
  });

  const handleFlipButtonPress = React.useCallback(() => {
    trackWalletShowBack(CREDENTIALS_MAP[credential.credentialType]);
    setIsFlipped(_ => !_);
  }, [credential.credentialType]);

  const { backgroundColor } = getThemeColorByCredentialType(
    credential.credentialType
  );

  const flipGesture = Gesture.Fling()
    .direction(Directions.LEFT + Directions.RIGHT)
    .onEnd(() => runOnJS(setIsFlipped)(!isFlipped));

  return (
    <VStack space={8}>
      <GestureDetector gesture={flipGesture}>
        <CardContainer backgroundColor={backgroundColor}>
          <ItwSkeumorphicCard
            credential={credential}
            isFlipped={isFlipped}
            status={status}
            onPress={fullScreenCardModal.present}
          />
        </CardContainer>
      </GestureDetector>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={handleFlipButtonPress}
      />
      {fullScreenCardModal.content}
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
    paddingHorizontal: cardPaddingHorizontal
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
