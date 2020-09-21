/**
 * Experimental type used for represent an async load from remote source with a simpler structure than the pot
 */
export type RemoteValue<V, E> =
  | RemoteUndefined
  | RemoteLoading
  | RemoteReady<V>
  | RemoteError<E>;

type RemoteUndefined = {
  readonly kind: "undefined";
};

type RemoteLoading = {
  readonly kind: "loading";
};

type RemoteReady<V> = {
  readonly kind: "ready";
  value: V;
};

type RemoteError<E> = {
  readonly kind: "error";
  error: E;
};

export declare const isUndefined: <V>(
  rv: RemoteValue<V, any>
) => rv is RemoteUndefined;

export declare const isLoading: <V>(
  rv: RemoteValue<V, any>
) => rv is RemoteLoading;

export declare const isReady: <V>(
  rv: RemoteValue<V, any>
) => rv is RemoteReady<V>;

export declare const isError: <V, E>(
  rv: RemoteValue<V, E>
) => rv is RemoteError<E>;

export const getValue = <V>(rv: RemoteValue<V, any>) =>
  isReady(rv) ? rv.value : undefined;

export const remoteUndefined: RemoteUndefined = { kind: "undefined" };
export const remoteLoading: RemoteLoading = { kind: "loading" };
export const remoteReady = <V>(v: V): RemoteReady<V> => ({
  kind: "ready",
  value: v
});

export const remoteError = <E>(e: E): RemoteError<E> => ({
  kind: "error",
  error: e
});
