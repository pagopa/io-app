import { ButtonSolid, H3, VStack } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ItwStoredCredentialsMocks } from "../../common/utils/itwMocksUtils";
import {
  CredentialCardSide,
  ItwSkeumorphicCredentialCard
} from "../../presentation/components/ItwSkeumorphicCredentialCard";

export const ItwSkeumorphicCredentialSection = () => {
  const [side, setSide] = React.useState<CredentialCardSide>("front");
  return (
    <VStack space={16}>
      <H3>{"Skeumorphic credential card"}</H3>
      <ItwSkeumorphicCredentialCard
        credential={ItwStoredCredentialsMocks.mdl}
        side={side}
      />
      <ButtonSolid
        label={side === "front" ? "Show rear" : "Show front"}
        onPress={() =>
          setSide(current => (current === "front" ? "rear" : "front"))
        }
        fullWidth={true}
      />
    </VStack>
  );
};
