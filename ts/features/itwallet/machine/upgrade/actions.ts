import { useIOStore } from "../../../../store/hooks";

export const createCredentialUpgradeActionsImplementation = (
  _store: ReturnType<typeof useIOStore>
) => ({
  storeCredential: () => undefined
});
