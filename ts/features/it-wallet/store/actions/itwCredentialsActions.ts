import { ActionType, createAsyncAction } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";

import { PidData } from "@pagopa/io-react-native-cie-pid";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { StoredCredential } from "../../utils/types";
import {
  CredentialCatalogAvailableItem,
  PidCredentialCatalogItem
} from "./../../utils/mocks";

/**
 * Action which requests a PID issuing.
 */
export const itwPid = createAsyncAction(
  "ITW_CREDENTIALS_PID_REQUEST",
  "ITW_CREDENTIALS_PID_SUCCESS",
  "ITW_CREDENTIALS_PID_FAILURE"
)<
  PidCredentialCatalogItem & { pidData: PidData },
  StoredCredential,
  ItWalletError
>();

/**
 * Action which adds the PID to the wallet.
 */
export const itwCredentialsAddPid = createAsyncAction(
  "ITW_CREDENTIAL_ADD_PID_REQUEST",
  "ITW_CREDENTIAL_ADD_PID_SUCCESS",
  "ITW_CREDENTIAL_ADD_PID_FAILURE"
)<O.Option<StoredCredential>, StoredCredential, ItWalletError>();

/**
 * Action to check if the citizen can add a credential to the wallet.
 */
export const itwCredentialsChecks = createAsyncAction(
  "ITW_CREDENTIALS_CHECKS_REQUEST",
  "ITW_CREDENTIALS_CHECKS_SUCCESS",
  "ITW_CREDENTIALS_CHECKS_FAILURE"
)<
  CredentialCatalogAvailableItem,
  CredentialCatalogAvailableItem,
  ItWalletError
>();

/**
 * Action to add a credential to the wallet.
 */
export const itwCredentialsAddCredential = createAsyncAction(
  "ITW_CREDENTIALS_ADD_REQUEST",
  "ITW_CREDENTIALS_ADD_SUCCESS",
  "ITW_CREDENTIALS_ADD_FAILURE"
)<StoredCredential, StoredCredential, ItWalletError>();

/**
 * Type for credentials related actions.
 */
export type ItwCredentialsActions =
  | ActionType<typeof itwPid>
  | ActionType<typeof itwCredentialsAddPid>
  | ActionType<typeof itwCredentialsChecks>
  | ActionType<typeof itwCredentialsAddCredential>;
