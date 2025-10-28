import { CredentialsCatalogue } from "@pagopa/io-react-native-wallet";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import { Env } from "./environment";

export type DigitalCredentialsCatalogue = Awaited<
  ReturnType<typeof CredentialsCatalogue.fetchAndParseCatalogue>
>;

export const fetchCredentialsCatalogue = (env: Env) =>
  CredentialsCatalogue.fetchAndParseCatalogue(env.WALLET_TA_BASE_URL, {
    appFetch: defaultRetryingFetch()
  });
