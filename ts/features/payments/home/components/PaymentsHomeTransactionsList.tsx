import {
  Divider,
  IOStyles,
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import { default as I18n } from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isPaymentsLatestTransactionsEmptySelector } from "../store/selectors";
import { walletLatestTransactionsBizEventsListPotSelector } from "../../biz-events-transaction/store/selectors";
import { getPaymentsLatestBizEventsTransactionsAction } from "../../biz-events-transaction/store/actions";
import { PaymentsBizEventsListItemTransaction } from "../../biz-events-transaction/components/PaymentsBizEventsListItemTransaction";
import { TransactionListItem } from "../../../../../definitions/pagopa/biz-events/TransactionListItem";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsTransactionBizEventsRoutes } from "../../biz-events-transaction/navigation/routes";
import { PaymentsHomeEmptyScreenContent } from "./PaymentsHomeEmptyScreenContent";

type Props = {
  enforcedLoadingState?: boolean;
};

const PaymentsHomeTransactionsList = ({ enforcedLoadingState }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const latestTransactionsPot = useIOSelector(
    walletLatestTransactionsBizEventsListPotSelector
  );

  const isLoading =
    pot.isLoading(latestTransactionsPot) || enforcedLoadingState;
  const isEmpty = useIOSelector(isPaymentsLatestTransactionsEmptySelector);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getPaymentsLatestBizEventsTransactionsAction.request());
    }, [dispatch])
  );

  const handleNavigateToTransactionDetails = (
    transaction: TransactionListItem
  ) => {
    if (transaction.transactionId === undefined) {
      return;
    }
    navigation.navigate(
      PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR,
      {
        screen:
          PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS,
        params: {
          transactionId: transaction.transactionId
        }
      }
    );
  };

  const handleNavigateToTransactionList = () => {
    navigation.navigate(
      PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR,
      {
        screen:
          PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_LIST_SCREEN
      }
    );
  };

  const renderItems = () => {
    if (!isLoading && pot.isSome(latestTransactionsPot)) {
      return (
        <View testID="PaymentsHomeTransactionsListTestID">
          {latestTransactionsPot.value.map((latestTransaction, index) => (
            <React.Fragment
              key={`transaction_${latestTransaction.transactionId}`}
            >
              <PaymentsBizEventsListItemTransaction
                key={`transaction_${latestTransaction.transactionId}`}
                onPress={() =>
                  handleNavigateToTransactionDetails(latestTransaction)
                }
                transaction={latestTransaction}
              />
              {index < latestTransactionsPot.value.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      );
    }

    return (
      <View testID="PaymentsHomeTransactionsListTestID-loading">
        {Array.from({ length: 10 }).map((_, index) => (
          <ListItemTransaction
            isLoading={true}
            key={index}
            transactionStatus="success"
            transactionAmount=""
            title=""
            subtitle=""
          />
        ))}
      </View>
    );
  };

  if (isEmpty) {
    return <PaymentsHomeEmptyScreenContent withPictogram={false} />;
  }

  return (
    <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
      <ListItemHeader
        label={I18n.t("features.payments.transactions.title")}
        accessibilityLabel={I18n.t("features.payments.transactions.title")}
        endElement={
          !isLoading
            ? {
                type: "buttonLink",
                componentProps: {
                  label: I18n.t("features.payments.transactions.button"),
                  onPress: handleNavigateToTransactionList
                }
              }
            : undefined
        }
      />
      {renderItems()}
    </Animated.View>
  );
};

export { PaymentsHomeTransactionsList };
