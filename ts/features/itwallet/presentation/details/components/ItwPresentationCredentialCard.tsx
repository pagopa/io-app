import {
  ContentWrapper,
  IOSpacingScale,
  VStack
} from "@pagopa/io-app-design-system";

import { PropsWithChildren, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { getMixPanelCredential, trackWalletShowBack } from "../../../analytics";
import { ItwSkeumorphicCard } from "../../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../../common/components/ItwSkeumorphicCard/FlipGestureDetector.tsx";
import { getThemeColorByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialStatusSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { itwIsClaimValueHiddenSelector } from "../../../common/store/selectors/preferences.ts";
import { ItwBadge } from "../../../common/components/ItwBadge.tsx";
import { useItwFeaturesEnabled } from "../../../common/hooks/useItwFeaturesEnabled.ts";
import { getItwDisplayCredentialStatus } from "../utils";
import { ItwPresentationCredentialCardFlipButton } from "./ItwPresentationCredentialCardFlipButton.tsx";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button and If L3 is enabled, it shows the badge.
 */
const ItwPresentationCredentialCard = ({ credential }: Props) => {
  const navigation = useIONavigation();
  const [isFlipped, setIsFlipped] = useState(false);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const { status: credentialStatus = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const isOffline = offlineAccessReason !== undefined;
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const status = getItwDisplayCredentialStatus(
    credentialStatus,
    eidStatus,
    isOffline
  );

  const handleFlipButtonPress = useCallback(() => {
    trackWalletShowBack(
      getMixPanelCredential(credential.credentialType, isItwL3)
    );
    setIsFlipped(_ => !_);
  }, [credential.credentialType, isItwL3]);

  const valuesHidden = useIOSelector(itwIsClaimValueHiddenSelector);
  const itwFeaturesEnabled = useItwFeaturesEnabled(credential);

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
    credential.credentialType,
    itwFeaturesEnabled
  );

  return (
    <VStack space={8}>
      <CardContainer backgroundColor={backgroundColor}>
        <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setIsFlipped}>
          <ItwSkeumorphicCard
            credential={credential}
            isFlipped={isFlipped}
            status={status}
            valuesHidden={valuesHidden}
            onPress={handleCardPress}
          />
        </FlipGestureDetector>
      </CardContainer>
      <ContentWrapper
        style={
          itwFeaturesEnabled ? styles.horizontalLayout : styles.centeredLayout
        }
      >
        {itwFeaturesEnabled && <ItwBadge />}
        <ItwPresentationCredentialCardFlipButton
          isFlipped={isFlipped}
          handleOnPress={handleFlipButtonPress}
        />
      </ContentWrapper>
    </VStack>
  );
};

type CardContainerProps = {
  backgroundColor: string;
};

const CardContainer = ({
  children,
  backgroundColor
}: PropsWithChildren<CardContainerProps>) => (
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
  },
  horizontalLayout: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  centeredLayout: {
    alignSelf: "center"
  }
});

export { ItwPresentationCredentialCard };
