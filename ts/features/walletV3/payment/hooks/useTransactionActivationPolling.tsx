import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { NewTransactionRequest } from "../../../../../definitions/pagopa/ecommerce/NewTransactionRequest";
import { TransactionInfo } from "../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  walletPaymentCreateTransaction,
  walletPaymentGetTransactionInfo
} from "../store/actions/networking";
import { walletPaymentTransactionSelector } from "../store/selectors";

const POLLING_DELAY = 1000;

type Props = {
  onTransactionActivated?: (transaction: TransactionInfo) => void;
};

const useTransactionActivationPolling = ({ onTransactionActivated }: Props) => {
  const dispatch = useIODispatch();
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);

  React.useEffect(() => {
    if (pot.isSome(transactionPot) && !pot.isLoading(transactionPot)) {
      const { transactionId, status } = transactionPot.value;

      if (status === TransactionStatusEnum.ACTIVATED) {
        onTransactionActivated?.(transactionPot.value);
      } else {
        setTimeout(() => {
          dispatch(walletPaymentGetTransactionInfo.request({ transactionId }));
        }, POLLING_DELAY);
      }
    }
  }, [dispatch, transactionPot, onTransactionActivated]);

  const createTransaction = (request: NewTransactionRequest) => {
    dispatch(walletPaymentCreateTransaction.request(request));
  };

  return {
    transactionPot,
    createTransaction
  };
};

export { useTransactionActivationPolling };
