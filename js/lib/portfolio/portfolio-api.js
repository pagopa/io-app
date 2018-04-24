/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import I18n from '../../i18n'

const lastUsage = I18n.t('portfolio.lastUsage')
const yesterday = I18n.t('portfolio.yesterday')
const today = I18n.t('portfolio.today')
const noNew = I18n.t('portfolio.noNewTransactions')

const todayAt = lastUsage + today
const yesterdayAt = lastUsage + yesterday

import type { CreditCard, Operation, PaymentMethod } from './types'

const cards: $ReadOnlyArray<CreditCard> = [
  {
    id: 1,
    brand: 'American Express',
    lastUsage: todayAt + '07:34',
    number: '3759 876543 21001',
    image: require('../../../img/portfolio/amex-cc.jpg')
  },
  {
    id: 2,
    brand: 'VISA',
    lastUsage: yesterdayAt + ' 10:20',
    number: '4000 1234 5678 9010',
    image: require('../../../img/portfolio/visa-cc.jpg')
  },
  {
    id: 3,
    brand: 'Mastercard',
    lastUsage: noNew,
    number: '5412 7556 7890 0000',
    image: require('../../../img/portfolio/mastercard-cc.png')
  },
  {
    id: 4,
    brand: 'RedCard',
    lastUsage: todayAt + '09:03',
    number: '4000 1234 5678 9010',
    image: require('../../../img/portfolio/simple-cc.png')
  }
]

const operations: $ReadOnlyArray<Operation> = [
  {
    cardId: 1,
    date: '17/04/2018',
    time: '07:34',
    subject: 'Certificato di residenza',
    recipient: 'Comune di Gallarate',
    amount: -20.02,
    currency: 'EUR',
    transactionCost: 0.5,
    isNew: true
  },
  {
    cardId: 2,
    date: '16/04/2018',
    time: '15:01',
    subject: 'Spesa Supermarket',
    recipient: 'Segrate',
    amount: -74.1,
    currency: 'EUR',
    transactionCost: 0.5,
    isNew: true
  },
  {
    cardId: 4,
    date: '15/04/2018',
    time: '08:56',
    subject: 'Prelievo contante',
    recipient: 'Busto Arsizio',
    amount: -200.0,
    currency: 'EUR',
    transactionCost: 0.5,
    isNew: true
  },
  {
    cardId: 2,
    date: '14/02/2018',
    time: '10:21',
    subject: 'Accredito per storno',
    recipient: 'Banca Sella',
    amount: 100.1,
    currency: 'USD',
    transactionCost: 0.5,
    isNew: false
  },
  {
    cardId: 4,
    date: '22/01/2018',
    time: '14:54',
    subject: 'Esecuzione atti notarili',
    recipient: 'Comune di Legnano',
    transactionCost: 0.5,
    amount: -56.0,
    currency: 'EUR',
    isNew: false
  },
  {
    cardId: 4,
    date: '01/01/2018',
    time: '23:34',
    subject: 'Pizzeria Da Gennarino',
    recipient: 'Busto Arsizio',
    amount: -45.0,
    currency: 'EUR',
    transactionCost: 0.5,
    isNew: false
  },
  {
    cardId: 1,
    date: '22/12/2017',
    time: '14:23',
    subject: 'Rimborso TARI 2012',
    recipient: 'Comune di Gallarate',
    amount: 150.2,
    currency: 'EUR',
    transactionCost: 0,
    isNew: false
  },
  {
    cardId: 1,
    date: '17/12/2017',
    time: '12:34',
    subject: 'Ristorante I Pini',
    recipient: 'Busto Arsizio',
    transactionCost: 0,
    amount: -134.0,
    currency: 'EUR',
    isNew: false
  },
  {
    cardId: 4,
    date: '13/12/2017',
    time: '10:34',
    subject: 'Estetista Estella',
    recipient: 'Milano - via Parini 12',
    transactionCost: 0.5,
    amount: -100.0,
    currency: 'EUR',
    isNew: false
  }
]

/**
 * Mocked Portfolio Data
 */
class PortfolioAPI {
  static getPaymentMethods(): $ReadOnlyArray<PaymentMethod> {
    return [
      {
        id: 0,
        type: 'Credit Card'
      },
      {
        id: 1,
        type: 'Bank Account'
      },
      {
        id: 2,
        type: 'Other'
      }
    ]
  }

  static getCreditCards(): $ReadOnlyArray<CreditCard> {
    return cards
  }

  static getCreditCard(creditCardId: number): ?CreditCard {
    return cards.find((card): boolean => card.id === creditCardId)
  }

  static getOperations(cardId: number): $ReadOnlyArray<Operation> {
    return operations.filter(
      (operation): boolean => operation.cardId === cardId
    )
  }

  static getLatestOperations(): $ReadOnlyArray<Operation> {
    return operations.slice(1, 5) // eslint-disable-line no-magic-numbers
  }
}

export default PortfolioAPI
