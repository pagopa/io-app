import { ListItemHeader, VStack } from "@pagopa/io-app-design-system";
import { constFalse, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { View } from "react-native";
import {
  availableCredentials,
  newCredentials
} from "../../common/utils/itwCredentialUtils";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwOnboardingModuleCredential } from "../../onboarding/components/ItwOnboardingModuleCredential";

export const ItwCredentialsIssuanceSection = () => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const isCredentialIssuancePending =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const selectedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption);

  const allCredentials = [...availableCredentials, ...newCredentials];

  const startIssuance = useCallback(
    (credentialType: string) => () => {
      machineRef.send({
        type: "select-credential",
        mode: "issuance",
        credentialType
      });
    },
    [machineRef]
  );

  return (
    <View>
      <ListItemHeader label="Credentials issuance" />
      <VStack space={8}>
        {allCredentials.map(type => (
          <ItwOnboardingModuleCredential
            key={`itw_credential_${type}`}
            type={type}
            isCredentialIssuancePending={isCredentialIssuancePending}
            isSelectedCredential={pipe(
              selectedCredentialOption,
              O.map(t => t === type),
              O.getOrElse(constFalse)
            )}
            onPress={startIssuance}
          />
        ))}
      </VStack>
    </View>
  );
};
