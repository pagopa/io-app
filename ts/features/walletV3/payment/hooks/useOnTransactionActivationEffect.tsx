import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { TransactionInfo } from "../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentGetTransactionInfo } from "../store/actions/networking";
import { walletPaymentTransactionSelector } from "../store/selectors";
import { getGenericError } from "../../../../utils/errors";

const INITIAL_DELAY = 250;
const MAX_TRIES = 3;

type EffectCallback = (
  transaction: TransactionInfo
) => void | (() => void | undefined);

/**
 * This custom hook manages the transition of a transaction's status from ACTIVATION_REQUESTED to ACTIVATED.
 * It employs a polling mechanism to continuously check the status, and once the status becomes ACTIVATED,
 * the specified effect is triggered.
 * @param effect Function to be executed upon transaction activation
 */
const useOnTransactionActivationEffect = (effect: EffectCallback) => {
  const dispatch = useIODispatch();
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);

  const delayRef = React.useRef(INITIAL_DELAY);
  const countRef = React.useRef(0);

  /* eslint-disable functional/immutable-data */
  React.useEffect(() => {
    const isMaxTriesExceeded =
      !pot.isError(transactionPot) && countRef.current > MAX_TRIES;

    if (pot.isSome(transactionPot) && !pot.isLoading(transactionPot)) {
      const { transactionId, status } = transactionPot.value;

      if (status === TransactionStatusEnum.ACTIVATED) {
        // Execute the effect function when the transaction is activated
        delayRef.current = INITIAL_DELAY;
        countRef.current = 0;
        return effect(transactionPot.value);
      } else if (isMaxTriesExceeded) {
        dispatch(
          walletPaymentGetTransactionInfo.failure(
            getGenericError(new Error("Max try reached"))
          )
        );
        return;
      } else {
        // Continue polling for transaction status with a timeout
        const timeout = setTimeout(() => {
          delayRef.current *= 2;
          countRef.current += 1;
          dispatch(walletPaymentGetTransactionInfo.request({ transactionId }));
        }, delayRef.current);
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
