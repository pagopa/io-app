import { CredentialIssuance, ItwVersion } from "@pagopa/io-react-native-wallet";

import { assert } from "../../../../utils/assert";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import {
  CredentialBundle,
  IssuerConfiguration
} from "../../common/utils/itwTypesUtils";
import { InvalidTslCredentialStatus } from "./errors";

/**
 * Function to get the credential status from its token status list (TSL). The list is fetched from the `uri` extracted from
 * the raw credential, it is verified and parsed, and then the credential status at `idx` is extracted.
 * When the status is not valid, the function throws so its behavior is consistent with `getCredentialStatusAssertion`.
 *
 * @param credentialBundle The bundle with the raw credential
 * @param itwVersion Current IT-Wallet specifications version
 * @param keys The JWKS to verify the status list
 * @returns The extracted credential status and the status list
 * @throws {InvalidTslCredentialStatus}
 */
export const getCredentialStatusFromStatusList = async (
  { credential, metadata }: CredentialBundle,
  itwVersion: ItwVersion,
  keys: IssuerConfiguration["keys"]
) => {
  const ioWallet = getIoWallet(itwVersion);
  assert(
    ioWallet.CredentialStatus.statusList.isSupported,
    `Status List is not supported by API ${itwVersion}`
  );

  const { uri, idx, statusList } =
    await ioWallet.CredentialStatus.statusList.get(
      credential,
      metadata.format as CredentialIssuance.CredentialFormat
    );
  const parsed = await ioWallet.CredentialStatus.statusList.verifyAndParse(
    keys,
    statusList
  );
  const { status, rawStatus } = ioWallet.CredentialStatus.statusList.getStatus(
    parsed.status_list,
    idx
  );

  // Every status check in the app is done against the lowercase value, so it is transformed here.
  // TODO: [SIW-4664] Export a more accurate type from `getStatus`.
  const canonicalStatus = status.toLowerCase();

  if (canonicalStatus !== "valid") {
    throw new InvalidTslCredentialStatus(metadata.credentialId);
  }

  return {
    idx,
    parsedStatusList: parsed,
    rawStatus,
    status: canonicalStatus,
    statusList,
    uri
  };
};
