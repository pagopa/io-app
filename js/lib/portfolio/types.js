/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

export type PaymentMethod = {
    id: number,
    type: string
};

export type CreditCard = {
    id: number,
    brand: string,
    lastUsage: string,
    number: string,
    image: any // eslint-disable-line flowtype/no-weak-types
};

export type Operation = {
    cardId: number,
    date: string,
    time: string,
    subject: string,
    recipient: string,
    amount: number,
    currency: string,
    transactionCost: number,
    isNew: boolean
};

