import { CardsActions } from './cards';
import { TransactionsActions } from './transactions';

export type WalletActions = CardsActions | TransactionsActions;