import { constFalse, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";

import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import {
  itwDisabledCredentialsSelector,
  itwNewCredentialsSelector
} from "../../common/store/selectors/remoteConfig";
import { isUpcomingCredential } from "../../common/utils/itwCredentialUtils";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { type CredentialsListEntry } from "../../credentialsCatalogue/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwOnboardingModuleCredential } from "./ItwOnboardingModuleCredential";

type Props = {
  credentialsToDisplay: ReadonlyArray<CredentialsListEntry>;
  isL2Credential?: boolean;
};

export const ItwOnboardingModuleCredentialsList = ({
  credentialsToDisplay,
  isL2Credential
}: Props) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();

  const remotelyDisabledCredentials = useIOSelector(
    itwDisabledCredentialsSelector
  );
  const newCredentials = useIOSelector(itwNewCredentialsSelector);
  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);
  const isItWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isL2WalletValid = useIOSelector(itwLifecycleIsValidSelector);

  const isCredentialIssuancePending =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const selectedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption);

  const beginCredentialIssuance = useOfflineToastGuard(
    useCallback(
      (type: string) => {
        const sendSelectCredential = () => {
          machineRef.send({
            type: "select-credential",
            credentialType: type,
            mode: "issuance"
          });
        };

        if (isUpcomingCredential(type)) {
          /**
           * The credential is an upcoming one, navigate to the screens which
           * displays more information about the upcoming credential
           */
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ISSUANCE.UPCOMING_CREDENTIAL
          });
        } else if (isL2Credential && !isItWalletValid) {
          if (isL2WalletValid) {
            /**
             * User has a whitelisted fiscal code but has requested a credential
             * in restricted mode the user has DocIO enabled
             */
            sendSelectCredential();
          } else {
            /**
             * User has a whitelisted fiscal code but has requested a credential
             * in restricted mode the user has DocIO disabled
             */
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.DISCOVERY.INFO,
              params: { level: "l2-fallback", credentialType: type }
            });
          }
        } else if (isL3Enabled && !isItWalletValid) {
          /**
           * User has a whitelisted fiscal code but has not yet obtained an IT
           * Wallet. If he requests an ITW credential, start the credential
           * issuance flow with contextual PID issuance
           */
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.DISCOVERY.INFO,
            params: { level: "l3", credentialType: type }
          });
        } else {
          /** Standard credential issuance */
          sendSelectCredential();
        }
      },
      [
        machineRef,
        navigation,
        isL3Enabled,
        isItWalletValid,
        isL2WalletValid,
        isL2Credential
      ]
    )
  );

  return credentialsToDisplay.map(({ type, name }) => (
    <ItwOnboardingModuleCredential
      credentialName={name}
      isActive={itwCredentialsTypes.includes(type)}
      isCredentialIssuancePending={isCredentialIssuancePending}
      isDisabled={remotelyDisabledCredentials.includes(type)}
      isNew={newCredentials.includes(type)}
      isSelectedCredential={pipe(
        selectedCredentialOption,
        O.map(t => t === type),
        O.getOrElse(constFalse)
      )}
      isUpcoming={isUpcomingCredential(type)}
      key={`itw_credential_${type}`}
      onPress={beginCredentialIssuance}
      showIcon={!isL3Enabled}
      type={type}
    />
  ));
};
