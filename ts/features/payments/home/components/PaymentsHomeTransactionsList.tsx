import {
  Divider,
  IOStyles,
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import * as analytics from "../analytics";
import { default as I18n } from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isPaymentsLatestTransactionsEmptySelector } from "../store/selectors";
import { walletLatestTransactionsBizEventsListPotSelector } from "../../bizEventsTransaction/store/selectors";
import { getPaymentsLatestBizEventsTransactionsAction } from "../../bizEventsTransaction/store/actions";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { PaymentsBizEventsListItemTransaction } from "../../bizEventsTransaction/components/PaymentsBizEventsListItemTransaction";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { BannerErrorState } from "../../../../components/ui/BannerErrorState";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsTransactionBizEventsRoutes } from "../../bizEventsTransaction/navigation/routes";
import { usePaymentsBackoffRetry } from "../../common/hooks/usePaymentsBackoffRetry";
import { clearPaymentsBackoffRetry } from "../../common/store/actions";
import { PaymentsBackoffRetry } from "../../common/types/PaymentsBackoffRetry";
import { PaymentsHomeEmptyScreenContent } from "./PaymentsHomeEmptyScreenContent";

type Props = {
  enforcedLoadingState?: boolean;
};

const PAYMENTS_HOME_TRANSACTIONS_LIST_BACKOFF: PaymentsBackoffRetry =
  "PAYMENTS_HOME_TRANSACTIONS_LIST_BACKOFF";

const PaymentsHomeTransactionsList = ({ enforcedLoadingState }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const latestTransactionsPot = useIOSelector(
    walletLatestTransactionsBizEventsListPotSelector
  );
  const { canRetryRequest } = usePaymentsBackoffRetry(
    PAYMENTS_HOME_TRANSACTIONS_LIST_BACKOFF
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

  React.useEffect(() => {
    if (
      pot.isSome(latestTransactionsPot) &&
      !pot.isLoading(latestTransactionsPot)
    ) {
      dispatch(
        clearPaymentsBackoffRetry(PAYMENTS_HOME_TRANSACTIONS_LIST_BACKOFF)
      );
    }
  }, [dispatch, latestTransactionsPot]);

  const handleNavigateToTransactionDetails = React.useCallback(
    ({ eventId, isPayer }: NoticeListItem) => {
      if (eventId === undefined) {
        return;
      }
      navigation.navigate(
        PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR,
        {
          screen:
            PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS,
          params: {
            transactionId: eventId,
            isPayer
          }
        }
      );
    },
    [navigation]
  );

  const handleOnRetry = () => {
    if (canRetryRequest()) {
      dispatch(getPaymentsLatestBizEventsTransactionsAction.request());
    }
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

  const renderLatestNoticesItems = () => {
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

    if (pot.isError(latestTransactionsPot)) {
      return (
        <BannerErrorState
          testID="PaymentsHomeTransactionsListTestID-error"
          label="Il caricamento delle ricevute è fallito."
          icon="warningFilled"
          actionText={I18n.t(
            "features.payments.transactions.error.banner.retryButton"
          )}
          onPress={handleOnRetry}
        />
      );
    }

    return (
      <View testID="PaymentsHomeTransactionsListTestID-loading">
        {Array.from({ length: 10 }).map((_, index) => (
          <ListItemTransaction
            isLoading={true}
            key={index}
            transaction={{
              amount: "",
              amountAccessibilityLabel: ""
            }}
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
    <Animated.View
      style={IOStyles.flex}
      layout={LinearTransition.duration(200)}
    >
      <ListItemHeader
        label={I18n.t("features.payments.transactions.title")}
        accessibilityLabel={I18n.t("features.payments.transactions.title")}
        endElement={
          !isLoading && !pot.isError(latestTransactionsPot)
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
      {renderLatestNoticesItems()}
    </Animated.View>
  );
};

export { PaymentsHomeTransactionsList };
