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

type PotState = 'EMPTY' | 'UNAVAILABLE' | 'READY' | 'PENDING' | 'FAILED'

/**
 * A Pot<A> represents potential data that may exist in seven different states.
 */
export class Pot<A> {
  state: PotState
  isEmpty = false
  isPending = false
  isFailed = false
  isStale = false
  isUnavailable = false

  /**
   * Whether this Pot contains a fresh value
   */
  isReady(): boolean {
    return !this.isEmpty && !this.isStale
  }

  /**
   * Whether this Pot is non empty
   */
  nonEmpty(): boolean {
    return !this.isEmpty
  }

  /**
   * Whether this Pot is ready
   */
  ready(value: A): Ready<A> {
    return new Ready(value)
  }

  /**
   * Whether this Pot is unavailable
   */
  unavailable(): Unavailable<A> {
    return new Unavailable()
  }

  /**
   * Returns the value of this Pot if it's non empty, or else returns `value`
   */
  getOrElse<B: A>(value: () => B): A {
    return value()
  }
}

/**
 * An empty Pot (no value yet), similar to a None Option
 */
export class Empty<A> extends Pot<A> {
  state = 'EMPTY'
  isEmpty = true

  pending(startTime: Date): Pending<A> {
    return new Pending(startTime)
  }

  fail<E>(error: E): Failed<E, A> {
    return new Failed(error)
  }
}

/**
 * Returns a new Empty Pot
 */
export function empty<A>(): Empty<A> {
  return new Empty()
}

/**
 * A Pot that cannot get a value and should be disabled
 */
export class Unavailable<A> extends Pot<A> {
  state = 'UNAVAILABLE'
  isEmpty = true
  isFailed = true
  isUnavailable = true

  pending(startTime: Date): Pending<A> {
    return new Pending(startTime)
  }

  fail<E>(error: E): Failed<E, A> {
    return new Failed(error)
  }
}

/**
 * A Pot with a valid value
 */
export class Ready<A> extends Pot<A> {
  state = 'READY'
  value: A

  constructor(value: A) {
    super()
    this.value = value
  }

  pending(startTime: Date): PendingStale<A> {
    return new PendingStale(this.value, startTime)
  }

  fail<E>(error: E): FailedStale<E, A> {
    return new FailedStale(this.value, error)
  }

  // eslint-disable-next-line no-unused-vars
  getOrElse<B: A>(value: () => B): A {
    return this.value
  }
}

/**
 * Base class for pending Pots
 */
class PendingBase<A> extends Pot<A> {
  state = 'PENDING'
  isPending = true
  startTime: Date
}

/**
 * A Pot that is about to get a value
 */
export class Pending<A> extends PendingBase<A> {
  isEmpty = true

  constructor(startTime: Date) {
    super()
    this.startTime = startTime
  }

  pending(startTime: Date): Pending<A> {
    return new Pending(startTime)
  }

  fail<E>(error: E): Failed<E, A> {
    return new Failed(error)
  }
}

/**
 * A Pot that is about to refresh its value
 */
export class PendingStale<A> extends PendingBase<A> {
  isStale = true
  value: A

  constructor(value: A, startTime: Date) {
    super()
    this.value = value
    this.startTime = startTime
  }

  pending(startTime: Date): PendingStale<A> {
    return new PendingStale(this.value, startTime)
  }

  fail<E>(error: E): FailedStale<E, A> {
    return new FailedStale(this.value, error)
  }

  // eslint-disable-next-line no-unused-vars
  getOrElse<B: A>(value: () => B): A {
    return this.value
  }
}

/**
 * Base class for failed Pots
 */
class FailedBase<E, A> extends Pot<A> {
  state = 'FAILED'
  isFailed = true
  error: E
}

/**
 * A Pot that failed to get a value
 */
export class Failed<E, A> extends FailedBase<E, A> {
  isEmpty = true

  constructor(error: E) {
    super()
    this.error = error
  }

  pending(startTime: Date): Pending<A> {
    return new Pending(startTime)
  }

  fail<E>(error: E): Failed<E, A> {
    return new Failed(error)
  }
}

/**
 * A Pot that failed to refresh a value
 */
export class FailedStale<E, A> extends FailedBase<E, A> {
  isStale = true
  value: A

  constructor(value: A, startTime: E) {
    super()
    this.value = value
    this.error = startTime
  }

  pending(startTime: Date): PendingStale<A> {
    return new PendingStale(this.value, startTime)
  }

  fail<E>(error: E): FailedStale<E, A> {
    return new FailedStale(this.value, error)
  }

  // eslint-disable-next-line no-unused-vars
  getOrElse<B: A>(value: () => B): A {
    return this.value
  }
}
