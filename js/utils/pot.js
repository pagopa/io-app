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
export class Pot<E, A> {
  _error: E

  // The state of this Pot (empty, unavailable, ready, pending, failed)
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
   * Returns the value of this Pot if it's non empty, or else returns `value`
   */
  getOrElse<B: A>(value: () => B): A {
    return value()
  }
}

/**
 * An empty Pot (no value yet), similar to a None Option
 */
export class Empty<E, A> extends Pot<E, A> {
  state = 'EMPTY'
  isEmpty = true

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
export class Unavailable<E, A> extends Pot<E, A> {
  state = 'UNAVAILABLE'
  isEmpty = true
  isFailed = true
  isUnavailable = true
}

/**
 * A Pot with a valid value
 */
export class Ready<E, A> extends Pot<E, A> {
  state = 'READY'
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
}

/**
 * Base class for pending Pots
 */
class PendingBase<E, A> extends Pot<E, A> {
  state = 'PENDING'
  isPending = true
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
  isEmpty = true

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
}

/**
 * A Pot that is about to refresh its value
 */
export class PendingStale<E, A> extends PendingBase<E, A> {
  isStale = true
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
}

/**
 * Base class for failed Pots
 */
class FailedBase<E, A> extends Pot<E, A> {
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

  /**
   * Transition this Pot to the Pending state
   */
  pending(startTime: Date): Pending<E, A> {
    return new Pending(startTime)
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
}
