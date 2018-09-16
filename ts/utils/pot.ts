export interface PotEmpty {
  readonly kind: "empty";
}

export interface PotLoading {
  readonly kind: "loading";
}

export interface PotDefined<T> {
  readonly kind: "defined";
  readonly value: T;
}

export interface PotError<E> {
  readonly kind: "error";
  readonly error: E;
}

export type Pot<T, E> = PotEmpty | PotLoading | PotDefined<T> | PotError<E>;
