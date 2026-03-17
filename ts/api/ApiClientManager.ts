/* eslint-disable functional/immutable-data */
import _ from "lodash";
import { Nullable } from "@pagopa/io-app-design-system";

export type BaseClientOptions = { readonly token: string };

export abstract class ApiClientManager<TClient, TOptions> {
  private client: Nullable<TClient> = null;
  protected clientOptions: Nullable<TOptions> = null;

  protected abstract createClient(
    baseUrl: string,
    clientOptions: TOptions
  ): TClient;

  protected isCacheValid(clientOptions: TOptions): boolean {
    return _.isEqual(this.clientOptions, clientOptions);
  }

  getClient(baseUrl: string, clientOptions: TOptions): TClient {
    if (this.client !== null && this.isCacheValid(clientOptions)) {
      return this.client;
    }
    this.clientOptions = clientOptions;
    return (this.client = this.createClient(baseUrl, clientOptions));
  }
}
