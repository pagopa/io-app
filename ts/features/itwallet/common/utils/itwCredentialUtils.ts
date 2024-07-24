import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../../i18n";
import { CredentialType } from "./itwMocksUtils";

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
