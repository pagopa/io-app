import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import sha from "sha.js";
import { decodeBase64 } from "@pagopa/io-react-native-jwt";
import I18n from "../../../../i18n";
import { CredentialType } from "./itwMocksUtils";
import { StoredCredential } from "./itwTypesUtils";

export const itwCredentialNameByCredentialType: {
  [type: string]: string;
} = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: I18n.t(
    "features.itWallet.credentialName.dc"
  ),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: I18n.t(
    "features.itWallet.credentialName.ts"
  ),
  [CredentialType.DRIVING_LICENSE]: I18n.t(
    "features.itWallet.credentialName.mdl"
  ),
  [CredentialType.PID]: I18n.t("features.itWallet.credentialName.eid")
};

export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault: string = ""
): string =>
  pipe(
    O.fromNullable(credentialType),
    O.map(type => itwCredentialNameByCredentialType[type]),
    O.getOrElse(() => withDefault)
  );

export const generateTrustmarkUrl = ({ credential }: StoredCredential) => {
  const [header, body, rest] = credential.split(".");
  const signature = rest.slice(0, rest.indexOf("~"));
  const dataHash = sha("sha256").update(`${header}.${body}`).digest("hex");
  const { kid } = JSON.parse(decodeBase64(header)) as { kid: string };
  const queryParams = new URLSearchParams({
    data_hash: dataHash,
    signature,
    kid
  });
  return `https://verify.eaa.ipzs.it?${queryParams}`;
};
