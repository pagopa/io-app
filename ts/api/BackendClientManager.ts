import _ from "lodash";
import { v4 as uuid } from "uuid";
import { Nullable } from "@pagopa/io-app-design-system";
import { SessionToken } from "../types/SessionToken";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { createClient as createComClient } from "../../definitions/backend/communication/client";
import { lollipopFetch } from "../features/lollipop/utils/fetch";
import { isDevEnv } from "../utils/environment";
import { createClient as createSMClient } from "../../definitions/session_manager/client";
import { defaultRetryingFetch } from "../utils/fetch";
import { createClient as createIDClient } from "../../definitions/backend/identity/client";
/* eslint-disable functional/immutable-data */

export const createComClientWithLollipop = (
  baseUrl: string,
  keyInfo: KeyInfo = {}
) =>
  createComClient({
    baseUrl,
    fetchApi: lollipopFetch({ nonce: uuid() }, keyInfo)
  });

export type ComBackendClient = ReturnType<typeof createComClientWithLollipop>;

export const createSMClientWithLollipop = (baseUrl: string) =>
  createSMClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type SMBackendClient = ReturnType<typeof createSMClientWithLollipop>;

export const createIDClientWithLollipop = (baseUrl: string) =>
  createIDClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IDBackendClient = ReturnType<typeof createIDClientWithLollipop>;

class BackendClientManager {
  private comClient: Nullable<ComBackendClient> = null;
  private idClient: Nullable<IDBackendClient> = null;
  private smClient: Nullable<SMBackendClient> = null;

  private keyInfo: KeyInfo | undefined = undefined;
  private sessionToken: SessionToken | undefined = undefined;

  getCommunicationBackendClient(
    baseUrl: string,
    token: SessionToken,
    keyInfo: KeyInfo = {}
  ): ComBackendClient {
    if (
      this.comClient !== null &&
      _.isEqual(keyInfo, this.keyInfo) &&
      token === this.sessionToken
    ) {
      return this.comClient;
    }

    return (this.comClient = createComClientWithLollipop(baseUrl, keyInfo));
  }

  getSMBackendClient(baseUrl: string, token: SessionToken): SMBackendClient {
    if (this.smClient !== null && token === this.sessionToken) {
      return this.smClient;
    }

    return (this.smClient = createSMClientWithLollipop(baseUrl));
  }

  getIDBackendClient(baseUrl: string, token: SessionToken): IDBackendClient {
    if (this.idClient !== null && token === this.sessionToken) {
      return this.idClient;
    }

    return (this.idClient = createIDClientWithLollipop(baseUrl));
  }
}

export const backendClientManager = new BackendClientManager();

export const TestBackendClientManager = isDevEnv
  ? {
      BackendClientManager
    }
  : {};
