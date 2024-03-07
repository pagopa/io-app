import { fetchTransactionsRequestWithExpBackoff } from "../../../../store/actions/wallet/transactions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { getTransactionsLoadedLength } from "../../../../store/reducers/wallet/transactions";

export const useTransactionHistory = () => {
  const dispatch = useIODispatch();
  const transactionLoadedLength = useIOSelector(getTransactionsLoadedLength);

  const loadNextHistoryPage = () => {
    dispatch(
      fetchTransactionsRequestWithExpBackoff({ start: transactionLoadedLength })
    );
  };

  const loadFirstHistoryPage = () => {
    dispatch(fetchTransactionsRequestWithExpBackoff({ start: 0 }));
  };

  return {
    loadNextHistoryPage,
    loadFirstHistoryPage
  };
};
