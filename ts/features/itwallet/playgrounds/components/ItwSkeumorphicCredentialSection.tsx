import {
  ListItemHeader,
  ListItemSwitch,
  VStack
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { View } from "react-native";
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

export const ItwSkeumorphicCredentialSection = () => {
  const [valuesHidden, setValuesHidden] = useState(false);
  return (
    <View>
      <ListItemHeader label="Skeumorphic credential card" />
      <ListItemSwitch
        label="Hide claim values"
        value={valuesHidden}
        onSwitchValueChange={() => {
          setValuesHidden(!valuesHidden);
        }}
      />
      <VStack space={16}>
        {Object.values(ItwStoredCredentialsMocks)
          .filter(({ credentialType }) =>
            credentialsWithCard.includes(credentialType)
          )
          .map(credential => (
            <ItwSkeumorphicCredentialItem
              key={credential.credentialType}
              credential={credential}
              valuesHidden={valuesHidden}
            />
          ))}
      </VStack>
    </View>
  );
};

const ItwSkeumorphicCredentialItem = ({
  credential,
  valuesHidden
}: {
  credential: StoredCredential;
  valuesHidden: boolean;
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
          valuesHidden={valuesHidden}
        />
      </FlipGestureDetector>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
      />
    </VStack>
  );
};
