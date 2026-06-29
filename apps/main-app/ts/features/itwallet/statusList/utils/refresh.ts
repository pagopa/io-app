import { assert } from "../../../../utils/assert";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { StatusListRepository } from "./repository";
import { StatusListContext } from "./types";

/**
 * Fetches, decodes, validates, and persists a Status List Token for the given URI.
 * The URI serves both as cache identity and fetch endpoint (matches the JWT `sub` claim).
 *
 * Best-effort: returns `true` on success, `false` on any failure.
 * A failed refresh never evicts an existing cached entry.
 */
export const refreshStatusListToken = async (
  context: StatusListContext,
  uri: string
): Promise<boolean> => {
  try {
    const ioWallet = getIoWallet(context.itwVersion);
    assert(
      ioWallet.CredentialStatus.statusList.isSupported,
      `Status List is not supported by IT-Wallet v${context.itwVersion}`
    );

    const rawStatusList =
      await ioWallet.CredentialStatus.statusList.getByUri(uri);
    const statusList =
      await ioWallet.CredentialStatus.statusList.verifyAndParse(
        [], // TODO add actual JWKs for signature verification
        rawStatusList
      );

    await StatusListRepository.upsert(uri, statusList);
    return true;
  } catch {
    return false;
  }
};
