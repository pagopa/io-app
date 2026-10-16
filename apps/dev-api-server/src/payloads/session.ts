import { fakerIT as faker } from "@faker-js/faker";
import { PublicSession } from "@io-app/api-types/generated/definitions/session_manager/PublicSession";
import { SpidLevel } from "@io-app/api-types/generated/definitions/session_manager/SpidLevel";
import QueryString from "qs";

import { getRandomValue } from "../utils/random";
import { validatePayload } from "../utils/validator";
import { IOResponse } from "./response";

const getToken = (defaultValue: string) =>
  getRandomValue(
    defaultValue,
    faker.string.alphanumeric(15).toUpperCase(),
    "global"
  );

const getExpirationDate = (days: number) => {
  const today = new Date();
  const expirationDate = new Date();

  expirationDate.setDate(today.getDate() + days);

  return expirationDate;
};

// eslint-disable-next-line functional/no-let
let mFIMSToken: string | undefined;
export const FIMSToken = () => {
  if (!mFIMSToken) {
    mFIMSToken = getToken("AAAAAAAAAAAAA5");
  }
  return mFIMSToken;
};

const generateSessionTokens = (): PublicSession => ({
  spidLevel: "https://www.spid.gov.it/SpidL2" as SpidLevel,
  walletToken: getToken("AAAAAAAAAAAAA1"),
  myPortalToken: getToken("AAAAAAAAAAAAA2"),
  bpdToken: getToken("AAAAAAAAAAAAA3"),
  zendeskToken: getToken("AAAAAAAAAAAAA4"),
  fimsToken: FIMSToken(),
  expirationDate: getExpirationDate(15)
});

// eslint-disable-next-line functional/no-let
let customSession: PublicSession | undefined;

const generateCustomObjectSessionTokens = (
  tokenString: string
): Partial<PublicSession> => {
  // Parse the tokenString to extract the tokens

  const tokenKeys = tokenString
    .replace(/[()]/g, "") // Remove parentheses
    .split(",") as Array<keyof PublicSession>; // Split by comma

  // Return a filtered object based on customSession
  const filteredEntries = tokenKeys.map(key => [key, customSession?.[key]]);
  return Object.fromEntries(filteredEntries) as Partial<PublicSession>;
};

export const createOrRefreshSessionTokens = () => {
  customSession = generateSessionTokens();
};

export const clearSessionTokens = () => {
  customSession = undefined;
};

export const getCustomSession = (
  query?: QueryString.ParsedQs
): IOResponse<PublicSession> | undefined =>
  customSession
    ? query?.fields && typeof query?.fields === "string"
      ? {
          payload: validatePayload(
            PublicSession,
            generateCustomObjectSessionTokens(query.fields)
          ),
          isJson: true
        }
      : {
          payload: validatePayload(PublicSession, customSession),
          isJson: true
        }
    : undefined;

export const shouldAddLollipopAssertionRef = (query?: QueryString.ParsedQs) =>
  !query?.fields ||
  (typeof query.fields === "string" &&
    query.fields.includes("lollipopAssertionRef"));
