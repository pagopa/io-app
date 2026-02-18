import * as O from "fp-ts/lib/Option";
import { constFalse, pipe } from "fp-ts/lib/function";
import { useCallback } from "react";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { itwDisabledCredentialsSelector } from "../../common/store/selectors/remoteConfig";
import {
  isNewCredential,
  isUpcomingCredential
} from "../../common/utils/itwCredentialUtils";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwOnboardingModuleCredential } from "./ItwOnboardingModuleCredential";

type Props = {
  credentialTypesToDisplay: Array<string>;
  restrictedMode?: boolean;
};

export const ItwOnboardingModuleCredentialsList = ({
  credentialTypesToDisplay,
  restrictedMode = false
}: Props) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();

  const remotelyDisabledCredentials = useIOSelector(
    itwDisabledCredentialsSelector
  );
  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);
  const isItWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const isCredentialIssuancePending =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const selectedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption);

  const beginCredentialIssuance = useOfflineToastGuard(
    useCallback(
      (type: string) => {
        if (isUpcomingCredential(type)) {
          /**
           * The credential is an upcoming one, navigate to the screens which displays
           * more information about the upcoming credential
           */
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ISSUANCE.UPCOMING_CREDENTIAL
          });
        } else if (isL3Enabled && !isItWalletValid) {
          /**
           * User has a whitelisted fiscal code but has not yet obtained an IT Wallet.
           * If he requests an ITW credential, start the credential issuance flow with contextual PID issuance
           */
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.DISCOVERY.INFO,
            params: {
              level: restrictedMode ? "l2" : "l3",
              credentialType: type
            }
          });
        } else {
          /**
           * Standard credential issuance
           */
          machineRef.send({
            type: "select-credential",
            credentialType: type,
            mode: "issuance"
          });
        }
      },
      [machineRef, navigation, isL3Enabled, isItWalletValid, restrictedMode]
    )
  );

  return credentialTypesToDisplay.map(type => (
    <ItwOnboardingModuleCredential
      key={`itw_credential_${type}`}
      type={type}
      isActive={itwCredentialsTypes.includes(type)}
      isDisabled={remotelyDisabledCredentials.includes(type)}
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
