// tslint:disable:no-let no-object-mutation

import { Mutex } from "async-mutex";
import { Function1, Lazy } from "fp-ts/lib/function";
import { fromNullable, Option } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { IResponseType } from "italia-ts-commons/lib/requests";
import { delay } from "redux-saga";

/**
 * Provides the logic for caching and updating a session token by wrapping
 * concurrent functions that need the token and may detect expired tokens.
 */
export class SessionManager<T> {
  private token?: T;
  private mutex = new Mutex();

  /**
   * Critical section:
   *
   * 1) Request (A) arrives and it needs to update the token, so it enters this
   *    section.
   * 2) While updating the token, another request arrives (B) that also sees the
   *    token is invalid and enters this section to update the token.
   * 3) (B) gets paused up since the mutex is locked by (A).
   * 4) (A) finishes updating the token with either a success or a failure.
   * 5) (B) gets resumed and could either find a valid token refreshed by (A)
   *    or a still invalid (undefined) token if (A)'s refresh failed.
   * 6) If the refresh failed, one or both (A) and (B) could retry the refresh
   *    again (depending on the state of their retry policy) and the flow starts
   *    again from (1)
   */
  private exclusiveTokenUpdate = async () => {
    await this.mutex.runExclusive(async () => {
      if (this.token === undefined) {
        // token is not available, attempt to fetch a new token
        try {
          this.token = (await this.refreshSession()).toUndefined();
        } catch {
          // token is expired and we can't refresh, clear the current token
          // since it's useless.
          this.token = undefined;
        }
      }
    });
    return this.token;
  };

  constructor(
    private refreshSession: () => Promise<Option<T>>,
    private maxRetries: number = 3
  ) {}

  /**
   * Returns the current token, is there's one
   */
  public get = () => fromNullable(this.token);

  /**
   * Returns a new function, with the same params of the provided function but
   * the first one, the token, that gets provided by the interal logic.
   */
  public withRefresh<R>(
    f: Function1<T, Promise<t.Validation<IResponseType<401, any> | R>>>
  ): Lazy<ReturnType<typeof f>> {
    return async () => {
      let count = 0;
      while (count <= this.maxRetries) {
        count += 1;
        await this.exclusiveTokenUpdate();
        if (this.token === undefined) {
          // if the token is still undefined, the refresh failed, try again
          // with a random delay to prevent the dogpile effect
          await delay(Math.ceil(Math.random() * 100) + 50);
          // TODO: add customizable retry/backoff policy
          continue;
        }
        const response = await f(this.token);
        // BEWARE: we can cast to any only because we know for sure that f will
        // always return a Promise<IResponseType<A, B>>
        if (response.isRight() && (response.value as any).status === 401) {
          // our token is expired, reset it
          // tslint:disable-next-line:no-object-mutation
          this.token = undefined;
          continue;
        }
        return response;
      }
      // max retries reached, reject the promise
      throw new Error("max-retries");
    };
  }
}
