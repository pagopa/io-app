import {
  BannerErrorState,
  ContentWrapper,
  Divider,
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { useEffect, useCallback, Fragment, useRef } from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { getPaymentsLatestReceiptAction } from "../../receipts/store/actions";
import { walletLatestReceiptListPotSelector } from "../../receipts/store/selectors";
import * as analytics from "../analytics";
import { isPaymentsLatestTransactionsEmptySelector } from "../store/selectors";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { usePaymentsBackoffRetry } from "../../common/hooks/usePaymentsBackoffRetry";
import { clearPaymentsBackoffRetry } from "../../common/store/actions";
import { PaymentsBackoffRetry } from "../../common/types/PaymentsBackoffRetry";
import { ReceiptListItemTransaction } from "../../receipts/components/ReceiptListItemTransaction";
import { PaymentsReceiptRoutes } from "../../receipts/navigation/routes";
import { PaymentsHomeEmptyScreenContent } from "./PaymentsHomeEmptyScreenContent";

type Props = {
  enforcedLoadingState?: boolean;
};

const PAYMENTS_HOME_TRANSACTIONS_LIST_BACKOFF: PaymentsBackoffRetry =
  "PAYMENTS_HOME_TRANSACTIONS_LIST_BACKOFF";

const PaymentsHomeTransactionsList = ({ enforcedLoadingState }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  // Used for swipe feature
  const openedItemRef = useRef<(() => void) | null>(null);

  const latestTransactionsPot = useIOSelector(
    walletLatestReceiptListPotSelector
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
      dispatch(getPaymentsLatestReceiptAction.request());
    }
  });

  useEffect(() => {
    if (
      pot.isSome(latestTransactionsPot) &&
      !pot.isLoading(latestTransactionsPot)
    ) {
      dispatch(
        clearPaymentsBackoffRetry(PAYMENTS_HOME_TRANSACTIONS_LIST_BACKOFF)
      );
    }
  }, [dispatch, latestTransactionsPot]);

  const handleNavigateToTransactionDetails = useCallback(
    ({ eventId, isPayer, isCart }: NoticeListItem) => {
      if (eventId === undefined) {
        return;
      }
      navigation.navigate(PaymentsReceiptRoutes.PAYMENT_RECEIPT_NAVIGATOR, {
        screen: PaymentsReceiptRoutes.PAYMENT_RECEIPT_DETAILS,
        params: {
          transactionId: eventId,
          isPayer,
          isCart
        }
      });
    },
    [navigation]
  );

  const handleOnRetry = () => {
    if (canRetryRequest()) {
      dispatch(getPaymentsLatestReceiptAction.request());
    }
  };

  const handleNavigateToTransactionList = () => {
    analytics.trackPaymentsOpenReceiptListing();
    navigation.navigate(PaymentsReceiptRoutes.PAYMENT_RECEIPT_NAVIGATOR, {
      screen: PaymentsReceiptRoutes.PAYMENT_RECEIPT_LIST_SCREEN
    });
  };

  const renderLatestNoticesItems = () => {
    if (!isLoading && pot.isSome(latestTransactionsPot)) {
      return (
        <View testID="PaymentsHomeTransactionsListTestID">
          {latestTransactionsPot.value.map((latestTransaction, index) => (
            <Fragment key={`transaction_${latestTransaction.eventId}${index}`}>
              <ReceiptListItemTransaction
                key={`transaction_${latestTransaction.eventId}${index}`}
                onPress={() =>
                  handleNavigateToTransactionDetails(latestTransaction)
                }
                transaction={latestTransaction}
                openedItemRef={openedItemRef}
                isFromPaymentsHome={true}
              />
              {index < latestTransactionsPot.value.length - 1 && <Divider />}
            </Fragment>
          ))}
        </View>
      );
    }

    if (pot.isError(latestTransactionsPot)) {
      return (
        <ContentWrapper>
          <BannerErrorState
            testID="PaymentsHomeTransactionsListTestID-error"
            label="Il caricamento delle ricevute è fallito."
            icon="warningFilled"
            actionText={I18n.t(
              "features.payments.transactions.error.banner.retryButton"
            )}
            onPress={handleOnRetry}
          />
        </ContentWrapper>
      );
    }

    return (
      <ContentWrapper testID="PaymentsHomeTransactionsListTestID-loading">
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
      </ContentWrapper>
    );
  };

  if (isEmpty) {
    return <PaymentsHomeEmptyScreenContent withPictogram={false} />;
  }

  return (
    <Animated.View style={{ flex: 1 }} layout={LinearTransition.duration(200)}>
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.payments.transactions.title")}
          accessibilityLabel={I18n.t("features.payments.transactions.title")}
          endElement={
            !isLoading && !pot.isError(latestTransactionsPot)
              ? {
                  type: "buttonLink",
                  componentProps: {
                    label: I18n.t("features.payments.transactions.button"),
                    onPress: handleNavigateToTransactionList,
                    accessibilityLabel: I18n.t(
                      "features.payments.transactions.button"
                    )
                  }
                }
              : undefined
          }
        />
      </ContentWrapper>
      {renderLatestNoticesItems()}
    </Animated.View>
  );
};

export { PaymentsHomeTransactionsList };
