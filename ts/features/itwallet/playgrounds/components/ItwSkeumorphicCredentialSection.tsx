import { ButtonLink, H3, VStack } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { ItwStoredCredentialsMocks } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { useCredentialFullScreenCardModal } from "../../presentation/hooks/useCredentialFullScreenCardModal";

const credentialsWithCard: ReadonlyArray<string> = [
  "MDL",
  "EuropeanDisabilityCard"
];

export const ItwSkeumorphicCredentialSection = () => (
  <VStack space={16}>
    <H3>{"Skeumorphic credential card"}</H3>

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
  const [isFlipped, setFlipped] = React.useState(false);

  const fullScreenCardModal = useCredentialFullScreenCardModal({ credential });

  const handleOnPress = () => {
    fullScreenCardModal.present();
  };

  return (
    <VStack key={credential.credentialType} space={16}>
      <ItwSkeumorphicCard
        credential={credential}
        isFlipped={isFlipped}
        onPress={handleOnPress}
      />
      <View
        style={{
          alignSelf: "center"
        }}
      >
        <ButtonLink
          label={I18n.t(
            `features.itWallet.presentation.credentialDetails.card.${
              isFlipped ? "showFront" : "showBack"
            }`
          )}
          onPress={() => setFlipped(_ => !_)}
          icon="switchCard"
          iconPosition="end"
        />
      </View>
      {fullScreenCardModal.content}
    </VStack>
  );
};
