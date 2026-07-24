import { v4 as uuid } from "uuid";

import { Client, createClient } from "../../definitions/identity/client";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { lollipopFetch } from "../features/lollipop/utils/fetch";
import { isTestEnv } from "../utils/environment";
import { ApiClientManager, BaseClientOptions } from "./ApiClientManager";

export type IdentityClient = Client<"Bearer">;

export type IdentityClientOptions = BaseClientOptions & {
  keyInfo: KeyInfo;
  signBody?: boolean;
};

class IdentityClientManager extends ApiClientManager<
  IdentityClient,
  IdentityClientOptions
> {
  protected createClient(
    baseUrl: string,
    { token, keyInfo, signBody = false }: IdentityClientOptions
  ): IdentityClient {
    return createClient({
      baseUrl,
      fetchApi: lollipopFetch({ nonce: uuid(), signBody }, keyInfo),
      withDefaults: op => params => op({ Bearer: `Bearer ${token}`, ...params })
    });
  }
}

export const identityClientManager = new IdentityClientManager();

export const TestIdentityClientManager = isTestEnv
  ? { IdentityClientManager }
  : {};
