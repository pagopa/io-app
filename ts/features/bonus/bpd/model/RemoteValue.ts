/**
 * Experimental type used for represent an async load from remote source with a simpler structure than the pot
 * Use this when you need to load a remote value one shot that shouldn't be updated later
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

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

export const isUndefined = <V>(
  rv: RemoteValue<V, any>
): rv is RemoteUndefined => rv.kind === "undefined";

export const isLoading = <V>(rv: RemoteValue<V, any>): rv is RemoteLoading =>
  rv.kind === "loading";

export const isReady = <V>(rv: RemoteValue<V, any>): rv is RemoteReady<V> =>
  rv.kind === "ready";

export const isError = <V, E>(rv: RemoteValue<V, E>): rv is RemoteError<E> =>
  rv.kind === "error";

export const getValue = <V>(rv: RemoteValue<V, any>) =>
  isReady(rv) ? rv.value : undefined;

export const getValueOrElse = <V>(
  rv: RemoteValue<V, any>,
  defaultValue: V
): V =>
  pipe(
    getValue(rv),
    O.fromNullable,
    O.getOrElse(() => defaultValue)
  );

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

export const foldW = <T, E, B, C>(
  rm: RemoteValue<T, E>,
  onUndefined: () => B,
  onLoading: () => B,
  onReady: (value: T) => B,
  onError: (error: E) => C
): B | C => {
  switch (rm.kind) {
    case "undefined": {
      return onUndefined();
    }
    case "loading": {
      return onLoading();
    }
    case "ready": {
      return onReady(rm.value);
    }
    case "error": {
      return onError(rm.error);
    }
  }
};

export const fold = <T, E, B>(
  rm: RemoteValue<T, E>,
  onUndefined: () => B,
  onLoading: () => B,
  onReady: (value: T) => B,
  onError: (error: E) => B
): B => foldW(rm, onUndefined, onLoading, onReady, onError);

export const foldK =
  <T, E, B>(
    onUndefined: () => B,
    onLoading: () => B,
    onReady: (value: T) => B,
    onError: (error: E) => B
  ) =>
  (rm: RemoteValue<T, E>): B =>
    foldW(rm, onUndefined, onLoading, onReady, onError);

export const foldKW =
  <T, E, B, C>(
    onUndefined: () => B,
    onLoading: () => B,
    onReady: (value: T) => B,
    onError: (error: E) => C
  ) =>
  (rm: RemoteValue<T, E>): B | C =>
    foldW(rm, onUndefined, onLoading, onReady, onError);
