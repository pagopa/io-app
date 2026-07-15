/* eslint-disable functional/immutable-data */
import { Nullable } from "@io-app/design-system";
import _ from "lodash";

export type BaseClientOptions = { readonly token: string };

export abstract class ApiClientManager<TClient, TOptions> {
  protected clientOptions: Nullable<TOptions> = null;
  private client: Nullable<TClient> = null;

  getClient(baseUrl: string, clientOptions: TOptions): TClient {
    if (this.client !== null && this.isCacheValid(clientOptions)) {
      return this.client;
    }
    this.clientOptions = clientOptions;
    return (this.client = this.createClient(baseUrl, clientOptions));
  }

  protected abstract createClient(
    baseUrl: string,
    clientOptions: TOptions
  ): TClient;

  protected isCacheValid(clientOptions: TOptions): boolean {
    return _.isEqual(this.clientOptions, clientOptions);
  }
}
