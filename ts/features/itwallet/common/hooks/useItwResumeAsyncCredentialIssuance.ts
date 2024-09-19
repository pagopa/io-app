/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { selectIsIdle } from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

type HookResult = {
  /**
   * Whether the machine is transitioning to the correct state when resuming issuance.
   */
  isRehydrating: boolean;
};

/**
 * This hook is used to transition the credential machine to the correct state
 * when the credential selection screen is bypassed (async issuance).
 * @param credentialType - An optional credential type for resuming the issuance
 */
export function useItwResumeAsyncCredentialIssuance(
  credentialType?: string
): HookResult {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const machineIsIdle =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsIdle);
  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);

  useOnFirstRender(
    () => {
      if (itwCredentialsTypes.includes(credentialType!)) {
        // TODO: handle credential already present
      }

      machineRef.send({
        type: "select-credential",
        credentialType: credentialType!,
        skipNavigation: true
      });
    },
    () => typeof credentialType === "string"
  );

  return {
    isRehydrating: typeof credentialType === "string" && machineIsIdle
  };
}
