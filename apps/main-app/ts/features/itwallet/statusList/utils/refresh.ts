import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import { CredentialStatus } from "@pagopa/io-react-native-wallet";
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

    const raw = await ioWallet.CredentialStatus.statusList.getByUri(uri);
    const payload = decodeJwt(raw).payload;
    const statusList = CredentialStatus.StatusList.parse(payload);

    await StatusListRepository.upsert(uri, statusList);
    return true;
  } catch {
    return false;
  }
};
