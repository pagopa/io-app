/* eslint-disable functional/immutable-data */
import { Nullable } from "@pagopa/io-app-design-system";
import { KeyInfo } from "../features/lollipop/utils/crypto";

export abstract class ApiClientManager<T> {
  private client: Nullable<T> = null;
  protected token: Nullable<string> = null;
  protected keyInfo: KeyInfo = {};

  protected abstract createClient(
    baseUrl: string,
    token: string,
    keyInfo: KeyInfo
  ): T;

  protected isCacheValid(token: string, _keyInfo?: KeyInfo): boolean {
    return this.token === token;
  }

  getClient(baseUrl: string, token: string, keyInfo: KeyInfo = {}): T {
    if (this.client !== null && this.isCacheValid(token, keyInfo)) {
      return this.client;
    }
    this.token = token;
    this.keyInfo = keyInfo;
    return (this.client = this.createClient(baseUrl, token, keyInfo));
  }
}
