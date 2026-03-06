 import {
  createClient,
  Client
} from "../../definitions/backend/identity/client";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { defaultRetryingFetch } from "../utils/fetch";
import { isDevEnv } from "../utils/environment";
import { ApiClientManager } from "./ApiClientManager";

export type IdentityClient = Client<"Bearer">;

class IdentityClientManager extends ApiClientManager<IdentityClient> {
  protected createClient(
    baseUrl: string,
    token: string,
    _keyInfo: KeyInfo
  ): IdentityClient {
    return createClient({
      baseUrl,
      fetchApi: defaultRetryingFetch(),
      withDefaults: op => params => op({ Bearer: `Bearer ${token}`, ...params })
    });
  }
}

export const identityClientManager = new IdentityClientManager();

export const TestIdentityClientManager = isDevEnv
  ? { IdentityClientManager }
  : {};
