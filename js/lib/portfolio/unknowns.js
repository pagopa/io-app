//@flow

import type { CreditCard, Operation } from './types'

export const UNKNOWN_CARD: CreditCard = {
  id: -1,
  brand: 'Unknows',
  lastUsage: '???',
  number: '0',
  image: null
}

export const UNKNOWN_OPERATION: Operation = {
  cardId: -1,
  date: '',
  time: '',
  subject: 'UNKNOWN OPERATION',
  recipient: '',
  amount: 0,
  currency: '?',
  transactionCost: 0,
  isNew: false
}
