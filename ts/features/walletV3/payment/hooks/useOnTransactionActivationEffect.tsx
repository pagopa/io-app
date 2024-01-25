import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { TransactionInfo } from "../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentGetTransactionInfo } from "../store/actions/networking";
import { walletPaymentTransactionSelector } from "../store/selectors";

const POLLING_DELAY = 1000;

/**
 * Custom hook that initiates polling for transaction status and triggers the provided
 * effect function when the transaction reaches the ACTIVATED status.
 * @param effect Function to be executed upon transaction activation
 */
const useOnTransactionActivationEffect = (
  effect: (transaction: TransactionInfo) => void
) => {
  const dispatch = useIODispatch();
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);

  React.useEffect(() => {
    if (pot.isSome(transactionPot) && !pot.isLoading(transactionPot)) {
      const { transactionId, status } = transactionPot.value;

      if (status === TransactionStatusEnum.ACTIVATED) {
        // Execute the effect function when the transaction is activated
        effect(transactionPot.value);
      } else {
        // Continue polling for transaction status with a timeout
        const timeout = setTimeout(() => {
          dispatch(walletPaymentGetTransactionInfo.request({ transactionId }));
        }, POLLING_DELAY);
        // Clean up the timeout to avoid memory leaks
        return () => {
          clearTimeout(timeout);
        };
      }
    }

    return undefined;
  }, [dispatch, transactionPot, effect]);
};

export { useOnTransactionActivationEffect };
