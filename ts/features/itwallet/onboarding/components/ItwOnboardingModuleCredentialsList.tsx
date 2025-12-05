import { useCallback } from "react";
import * as O from "fp-ts/lib/Option";
import { constFalse, pipe } from "fp-ts/lib/function";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  isNewCredential,
  isUpcomingCredential
} from "../../common/utils/itwCredentialUtils";
import { itwRequestedCredentialsSelector } from "../../common/store/selectors/preferences";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { itwDisabledCredentialsSelector } from "../../common/store/selectors/remoteConfig";
import { ItwOnboardingModuleCredential } from "./ItwOnboardingModuleCredential";

type Props = {
  credentialTypesToDisplay: Array<string>;
};

export const ItwOnboardingModuleCredentialsList = ({
  credentialTypesToDisplay
}: Props) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();

  const remotelyDisabledCredentials = useIOSelector(
    itwDisabledCredentialsSelector
  );
  const requestedCredentials = useIOSelector(itwRequestedCredentialsSelector);
  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);
  const isITWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const isCredentialIssuancePending =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const selectedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption);

  const beginCredentialIssuance = useOfflineToastGuard(
    useCallback(
      (type: string) => {
        if (isUpcomingCredential(type)) {
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ISSUANCE.UPCOMING_CREDENTIAL
          });
        } else if (!isITWalletValid && isNewCredential(type)) {
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ISSUANCE.IT_WALLET_INACTIVE
          });
        } else {
          machineRef.send({
            type: "select-credential",
            credentialType: type,
            mode: "issuance"
          });
        }
      },
      [isITWalletValid, machineRef, navigation]
    )
  );

  return credentialTypesToDisplay.map(type => (
    <ItwOnboardingModuleCredential
      key={`itw_credential_${type}`}
      type={type}
      isActive={itwCredentialsTypes.includes(type)}
      isDisabled={remotelyDisabledCredentials.includes(type)}
      isRequested={requestedCredentials.includes(type)}
      isUpcoming={isUpcomingCredential(type)}
      isNew={isNewCredential(type)}
      isCredentialIssuancePending={isCredentialIssuancePending}
      isSelectedCredential={pipe(
        selectedCredentialOption,
        O.map(t => t === type),
        O.getOrElse(constFalse)
      )}
      onPress={beginCredentialIssuance}
    />
  ));
};
