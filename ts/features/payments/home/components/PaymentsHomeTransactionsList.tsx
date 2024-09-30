import {
  Divider,
  IOStyles,
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import * as analytics from "../analytics";
import { default as I18n } from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isPaymentsLatestTransactionsEmptySelector } from "../store/selectors";
import { walletLatestTransactionsBizEventsListPotSelector } from "../../bizEventsTransaction/store/selectors";
import { getPaymentsLatestBizEventsTransactionsAction } from "../../bizEventsTransaction/store/actions";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { PaymentsBizEventsListItemTransaction } from "../../bizEventsTransaction/components/PaymentsBizEventsListItemTransaction";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsTransactionBizEventsRoutes } from "../../bizEventsTransaction/navigation/routes";
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
    (!pot.isSome(latestTransactionsPot) &&
      pot.isLoading(latestTransactionsPot)) ||
    enforcedLoadingState;
  const isEmpty = useIOSelector(isPaymentsLatestTransactionsEmptySelector);

  useOnFirstRender(() => {
    if (pot.isNone(latestTransactionsPot)) {
      dispatch(getPaymentsLatestBizEventsTransactionsAction.request());
    }
  });

  const handleNavigateToTransactionDetails = (transaction: NoticeListItem) => {
    if (transaction.eventId === undefined) {
      return;
    }
    navigation.navigate(
      PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR,
      {
        screen:
          PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS,
        params: {
          transactionId: transaction.eventId,
          isPayer: transaction.isPayer
        }
      }
    );
  };

  const handleNavigateToTransactionList = () => {
    analytics.trackPaymentsOpenReceiptListing();
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
            <React.Fragment key={`transaction_${latestTransaction.eventId}`}>
              <PaymentsBizEventsListItemTransaction
                key={`transaction_${latestTransaction.eventId}`}
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
