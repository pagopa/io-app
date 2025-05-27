import { useIOStore } from "../../../../store/hooks";
import { itwL2CredentialsSelector } from "../../credentials/store/selectors";

export const createCredentialUpgradeActionsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  storeCredential: () => {
    const credentials = itwL2CredentialsSelector(store.getState());
    return {
      credentials
    };
  }
});
