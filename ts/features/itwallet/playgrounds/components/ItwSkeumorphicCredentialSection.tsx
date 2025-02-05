import { ListItemHeader, VStack } from "@pagopa/io-app-design-system";
import { useState } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../common/components/ItwSkeumorphicCard/FlipGestureDetector";
import { getCredentialStatusObject } from "../../common/utils/itwCredentialStatusUtils";
import { ItwStoredCredentialsMocks } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwPresentationCredentialCardFlipButton } from "../../presentation/details/components/ItwPresentationCredentialCardFlipButton";

const credentialsWithCard: ReadonlyArray<string> = [
  "MDL",
  "EuropeanDisabilityCard"
];

export const ItwSkeumorphicCredentialSection = () => (
  <VStack space={16}>
    <ListItemHeader label="Skeumorphic credential card" />

    {Object.values(ItwStoredCredentialsMocks)
      .filter(({ credentialType }) =>
        credentialsWithCard.includes(credentialType)
      )
      .map(credential => (
        <ItwSkeumorphicCredentialItem
          key={credential.credentialType}
          credential={credential}
        />
      ))}
  </VStack>
);

const ItwSkeumorphicCredentialItem = ({
  credential
}: {
  credential: StoredCredential;
}) => {
  const navigation = useIONavigation();
  const [isFlipped, setFlipped] = useState(false);
  const { status = "valid" } = getCredentialStatusObject(credential);

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
      params: {
        credential,
        status
      }
    });
  };

  return (
    <VStack key={credential.credentialType} space={16}>
      <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setFlipped}>
        <ItwSkeumorphicCard
          credential={credential}
          status={status}
          isFlipped={isFlipped}
          onPress={handleOnPress}
        />
      </FlipGestureDetector>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
      />
    </VStack>
  );
};
