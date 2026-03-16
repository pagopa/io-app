/* eslint-disable functional/immutable-data */
import { v4 as uuid } from "uuid";
import _ from "lodash";
import {
  createClient,
  Client
} from "../../definitions/backend/identity/client";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { isDevEnv } from "../utils/environment";
import { lollipopFetch } from "../features/lollipop/utils/fetch";
import { ApiClientManager } from "./ApiClientManager";

export type IdentityClient = Client<"Bearer">;

class IdentityClientManager extends ApiClientManager<IdentityClient> {
  // The `signBody` value committed at last client creation, used in `lollipopFetch`.
  private signBody: boolean = false;
  // The `signBody` value staged by `getClient`, compared in `isCacheValid` to detect
  // changes and trigger a cache miss before the next `createClient` call.
  private nextSignBody: boolean = false;

  protected createClient(
    baseUrl: string,
    token: string,
    keyInfo: KeyInfo
  ): IdentityClient {
    this.signBody = this.nextSignBody;

    return createClient({
      baseUrl,
      fetchApi: lollipopFetch({ nonce: uuid(), signBody: this.signBody }, keyInfo),
      withDefaults: op => params => op({ Bearer: `Bearer ${token}`, ...params })
    });
  }

  protected override isCacheValid(token: string, keyInfo: KeyInfo): boolean {
    return (
      super.isCacheValid(token) &&
      _.isEqual(this.keyInfo, keyInfo) &&
      this.signBody === this.nextSignBody
    );
  }

  // Override to make `keyInfo` required: unlike the base class, which accepts
  // it as optional (defaulting to `{}`), this client always needs a valid
  // KeyInfo to sign requests via Lollipop.
  override getClient(
    baseUrl: string,
    token: string,
    keyInfo: KeyInfo,
    signBody: boolean = false
  ) {
    this.nextSignBody = signBody;

    return super.getClient(baseUrl, token, keyInfo);
  }
}

export const identityClientManager = new IdentityClientManager();

export const TestIdentityClientManager = isDevEnv
  ? { IdentityClientManager }
  : {};
