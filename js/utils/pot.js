/*
 * Helper types that define the states of a remote data object.
 *
 * Inspired by https://diode.suzaku.io/advanced/Pot.html
 * Read the link above to unerstand how this works.
 *
 * Mostly converted from Scala code here:
 * https://github.com/suzaku-io/diode/blob/master/diode-data/shared/src/main/scala/diode/data/Pot.scala
 *
 * @flow
 *
 */

/* eslint-disable no-use-before-define */

export type Pot<E, A> =
  | Empty<E, A>
  | Unavailable<E, A>
  | Ready<E, A>
  | Pending<E, A>
  | Failed<E, A>
  | PendingStale<E, A>
  | FailedStale<E, A>

/**
 * A Pot<A> represents potential data that may exist in seven different states.
 */
class PotBase<E, A> {
  _error: E

  /**
   * Returns the value of this Pot if it's non empty, or else returns `value`
   */
  getOrElse<B: A>(value: () => B): A {
    return value()
  }

  /**
   * Maps this Pot to a value that depends on the Pot state
   */
  fold<TE, TR, TP, TF, TPS, TFS, TU>(
    fEmpty: () => TE,
    fReady: (value: A) => TR,
    fPending: (startTime: Date) => TP,
    fFailed: (error: E) => TF,
    fPendingStale: (value: A, startTime: Date) => TPS,
    fFailedStale: (value: A, error: E) => TFS,
    fUnavailable: () => TU
  ): null | TE | TR | TP {
    if (this instanceof Empty) {
      return fEmpty()
    }
    if (this instanceof Ready) {
      return fReady(this.value)
    }
    if (this instanceof Pending) {
      return fPending(this.startTime)
    }
    if (this instanceof Failed) {
      return fFailed(this.error)
    }
    if (this instanceof PendingStale) {
      return fPendingStale(this.value, this.startTime)
    }
    if (this instanceof FailedStale) {
      return fFailedStale(this.value, this.error)
    }
    if (this instanceof Unavailable) {
      return fUnavailable()
    }
    // flow should never reach this point
    return null
  }
}

/**
 * An empty Pot (no value yet), similar to a None Option
 */
export class Empty<E, A> extends PotBase<E, A> {
  /**
   * Transition this Pot to the Ready state
   */
  ready(value: A): Ready<E, A> {
    return new Ready(value)
  }

  /**
   * Transition this Pot to the Pending state
   */
  pending(startTime: Date): Pending<E, A> {
    return new Pending(startTime)
  }

  // eslint-disable-next-line no-unused-vars
  map<B>(app: (value: A) => B): Pot<E, B> {
    return empty()
  }
}

/**
 * Returns a new Empty Pot
 */
export function empty<E, A>(): Empty<E, A> {
  return new Empty()
}

/**
 * A Pot that cannot get a value and should be disabled
 */
export class Unavailable<E, A> extends PotBase<E, A> {
  // eslint-disable-next-line no-unused-vars
  map<B>(app: (value: A) => B): Pot<E, B> {
    return new Unavailable()
  }
}

/**
 * A Pot with a valid value
 */
export class Ready<E, A> extends PotBase<E, A> {
  value: A

  constructor(value: A) {
    super()
    this.value = value
  }

  /**
   * Transition this Pot to the PendingStale state
   */
  pending(startTime: Date): PendingStale<E, A> {
    return new PendingStale(this.value, startTime)
  }

  /**
   * {@inheritDoc}
   */
  // eslint-disable-next-line no-unused-vars
  getOrElse<B: A>(value: () => B): A {
    return this.value
  }

  map<B>(app: (value: A) => B): Pot<E, B> {
    return new Ready(app(this.value))
  }
}

/**
 * Base class for pending Pots
 */
class PendingBase<E, A> extends PotBase<E, A> {
  startTime: Date

  /**
   * Transition this Pot to the Ready state
   */
  ready(value: A): Ready<E, A> {
    return new Ready(value)
  }
}

/**
 * A Pot that is about to get a value
 */
export class Pending<E, A> extends PendingBase<E, A> {
  constructor(startTime: Date) {
    super()
    this.startTime = startTime
  }

  /**
   * Keep this Pot in the Pending state and update the startTime
   */
  pending(startTime: Date): Pending<E, A> {
    return new Pending(startTime)
  }

  /**
   * Transition this Pot to the Failed state
   */
  fail<E>(error: E): Failed<E, A> {
    return new Failed(error)
  }

  /**
   * Transition this Pot to the Unavailable state
   */
  unavailable(): Unavailable<E, A> {
    return new Unavailable()
  }

  // eslint-disable-next-line no-unused-vars
  map<B>(app: (value: A) => B): Pot<E, B> {
    return new Pending(this.startTime)
  }
}

/**
 * A Pot that is about to refresh its value
 */
export class PendingStale<E, A> extends PendingBase<E, A> {
  value: A

  constructor(value: A, startTime: Date) {
    super()
    this.value = value
    this.startTime = startTime
  }

  /**
   * Transition this Pot to the PendingStale state
   */
  pending(startTime: Date): PendingStale<E, A> {
    return new PendingStale(this.value, startTime)
  }

  /**
   * Transition this Pot to the FailedStale state
   */
  fail<E>(error: E): FailedStale<E, A> {
    return new FailedStale(this.value, error)
  }

  /**
   * {@inheritDoc}
   */
  // eslint-disable-next-line no-unused-vars
  getOrElse<B: A>(value: () => B): A {
    return this.value
  }

  map<B>(app: (value: A) => B): Pot<E, B> {
    return new PendingStale(app(this.value), this.startTime)
  }
}

/**
 * Base class for failed Pots
 */
class FailedBase<E, A> extends PotBase<E, A> {
  error: E
}

/**
 * A Pot that failed to get a value
 */
export class Failed<E, A> extends FailedBase<E, A> {
  constructor(error: E) {
    super()
    this.error = error
  }

  /**
   * Transition this Pot to the Pending state
   */
  pending(startTime: Date): Pending<E, A> {
    return new Pending(startTime)
  }

  // eslint-disable-next-line no-unused-vars
  map<B>(app: (value: A) => B): Pot<E, B> {
    return new Failed(this.error)
  }
}

/**
 * A Pot that failed to refresh a value
 */
export class FailedStale<E, A> extends FailedBase<E, A> {
  value: A

  constructor(value: A, error: E) {
    super()
    this.value = value
    this.error = error
  }

  /**
   * Transition this Pot to the PendingStale state
   */
  pending(startTime: Date): PendingStale<E, A> {
    return new PendingStale(this.value, startTime)
  }

  /**
   * {@inheritDoc}
   */
  // eslint-disable-next-line no-unused-vars
  getOrElse<B: A>(value: () => B): A {
    return this.value
  }

  map<B>(app: (value: A) => B): Pot<E, B> {
    return new FailedStale(app(this.value), this.error)
  }
}
