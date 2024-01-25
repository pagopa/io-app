import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { TransactionInfo } from "../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentGetTransactionInfo } from "../store/actions/networking";
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
        const timeout = setTimeout(() => {
          dispatch(walletPaymentGetTransactionInfo.request({ transactionId }));
        }, POLLING_DELAY);
        return () => {
          clearTimeout(timeout);
        };
      }
    }

    return undefined;
  }, [dispatch, transactionPot, onTransactionActivated]);
};

export { useTransactionActivationPolling };
