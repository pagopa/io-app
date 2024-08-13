import { ButtonSolid, H3, VStack } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ItwStoredCredentialsMocks } from "../../common/utils/itwMocksUtils";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";

export const ItwSkeumorphicCredentialSection = () => {
  const [isFlipped, setFlipped] = React.useState(false);

  return (
    <VStack space={16}>
      <H3>{"Skeumorphic credential card"}</H3>
      <ItwSkeumorphicCard
        credential={ItwStoredCredentialsMocks.mdl}
        isFlipped={isFlipped}
      />
      <ButtonSolid
        label={isFlipped ? "Show front" : "Show rear"}
        onPress={() => setFlipped(_ => !_)}
        fullWidth={true}
      />
    </VStack>
  );
};
