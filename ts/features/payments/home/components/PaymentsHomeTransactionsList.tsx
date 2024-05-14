import { constVoid } from "fp-ts/lib/function";
import {
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
import { getPaymentsTransactionsAction } from "../../transaction/store/actions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletTransactionsListPotSelector } from "../../transaction/store/selectors";
import { isPaymentsTransactionsEmptySelector } from "../store/selectors";
import { PaymentsHomeEmptyScreenContent } from "./PaymentsHomeEmptyScreenContent";
import { PaymentsBizEventsListItemTransaction } from "./PaymentsBizEventsListItemTransaction";

type Props = {
  enforcedLoadingState?: boolean;
};

const PaymentsHomeTransactionsList = ({ enforcedLoadingState }: Props) => {
  const dispatch = useIODispatch();

  const transactionsPot = useIOSelector(walletTransactionsListPotSelector);

  const isLoading = pot.isLoading(transactionsPot) || enforcedLoadingState;
  const isEmpty = useIOSelector(isPaymentsTransactionsEmptySelector);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getPaymentsTransactionsAction.request({}));
    }, [dispatch])
  );

  const renderItems = () => {
    if (!isLoading && pot.isSome(transactionsPot)) {
      return (
        <View testID="PaymentsHomeTransactionsListTestID">
          {transactionsPot.value.map(transaction => (
            <PaymentsBizEventsListItemTransaction
              key={`transaction_${transaction.transactionId}`}
              onPress={() => constVoid}
              transaction={transaction}
            />
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
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("features.payments.transactions.button"),
            onPress: () => constVoid
          }
        }}
      />
      {renderItems()}
    </Animated.View>
  );
};

export { PaymentsHomeTransactionsList };
