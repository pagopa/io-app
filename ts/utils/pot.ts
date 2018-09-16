export interface PotEmpty {
  readonly kind: "PotEmpty";
}

export const potEmpty: PotEmpty = {
  kind: "PotEmpty"
};

export interface PotPending {
  readonly kind: "PotPending";
}

export const potPending: PotPending = {
  kind: "PotPending"
};

export interface PotSuccess<T> {
  readonly kind: "PotSuccess";
  readonly value: T;
}

export interface PotFailure {
  readonly kind: "PotFailure";
  readonly error: Error;
}

export type Pot<T> = PotEmpty | PotPending | PotSuccess<T> | PotFailure;

function map<A, B>(p: Pot<A>, f: (v: A) => B): Pot<B> {
  if (p.kind === "PotSuccess") {
    return {
      ...p,
      value: f(p.value)
    };
  }
  return p;
}

export const pot = {
  map
};
