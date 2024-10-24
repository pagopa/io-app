import {
  Banner,
  IOVisualCostants,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View } from "react-native";
import * as analytics from "../analytics";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentCardSmallProps } from "../../common/components/PaymentCardSmall";
import { getPaymentCardPropsFromWalletInfo } from "../../common/utils";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";
import { paymentsWalletUserMethodsSelector } from "../../wallet/store/selectors";
import { paymentsSetAddMethodsBannerVisible } from "../store/actions";
import { isAddMethodsBannerVisibleSelector } from "../store/selectors";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { BannerErrorState } from "../../../../components/ui/BannerErrorState";
import { usePaymentsBackoffRetry } from "../../common/hooks/usePaymentsBackoffRetry";
import { clearPaymentsBackoffRetry } from "../../common/store/actions";
import {
  PaymentCardsCarousel,
  PaymentCardsCarouselSkeleton
} from "./PaymentsCardsCarousel";

type Props = {
  enforcedLoadingState?: boolean;
};

const PAYMENTS_HOME_USER_METHODS_BACKOFF = "PAYMENTS_HOME_USER_METHODS_BACKOFF";

const PaymentsHomeUserMethodsList = ({ enforcedLoadingState }: Props) => {
  const bannerRef = React.createRef<View>();

  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const shouldShowAddMethodsBanner = useIOSelector(
    isAddMethodsBannerVisibleSelector
  );
  const paymentMethodsPot = useIOSelector(paymentsWalletUserMethodsSelector);
  const paymentMethods = pot.getOrElse(paymentMethodsPot, []);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const { canRetryRequest } = usePaymentsBackoffRetry(
    PAYMENTS_HOME_USER_METHODS_BACKOFF
  );
  const isError = React.useMemo(
    () => pot.isError(paymentMethodsPot) && !pot.isSome(paymentMethodsPot),
    [paymentMethodsPot]
  );

  const isLoading =
    (!pot.isSome(paymentMethodsPot) && pot.isLoading(paymentMethodsPot)) ||
    enforcedLoadingState;
  const isEmpty = paymentMethods.length === 0;

  useOnFirstRender(() => {
    if (pot.isNone(paymentMethodsPot)) {
      dispatch(getPaymentsWalletUserMethods.request());
    }
  });

  React.useEffect(() => {
    if (pot.isSome(paymentMethodsPot) && !pot.isLoading(paymentMethodsPot)) {
      dispatch(clearPaymentsBackoffRetry(PAYMENTS_HOME_USER_METHODS_BACKOFF));
    }
  }, [dispatch, paymentMethodsPot]);

  const handleOnMethodPress = (walletId: string) => () => {
    navigation.navigate(
      PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR,
      {
        screen: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN,
        params: {
          walletId
        }
      }
    );
  };

  const handleOnAddMethodPress = () => {
    analytics.trackPaymentWalletAddStart({
      add_entry_point: "payments_home",
      wallet_item: "payment_method",
      payments_home_status: paymentAnalyticsData?.paymentsHomeStatus,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length ?? 0
    });
    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  const handleOnRetry = React.useCallback(() => {
    if (canRetryRequest()) {
      dispatch(getPaymentsWalletUserMethods.request());
    }
  }, [dispatch, canRetryRequest]);

  const userMethods = paymentMethods.map(
    (method: WalletInfo): PaymentCardSmallProps => ({
      ...getPaymentCardPropsFromWalletInfo(method),
      onPress: handleOnMethodPress(method.walletId)
    })
  );

  const PaymentCardsCarouselContent = React.useMemo(
    () =>
      isError ? (
        <BannerErrorState
          label={I18n.t("features.payments.methods.error.banner.label")}
          icon="warningFilled"
          actionText={I18n.t(
            "features.payments.methods.error.banner.retryButton"
          )}
          onPress={handleOnRetry}
        />
      ) : (
        <PaymentCardsCarousel
          cards={userMethods}
          testID="PaymentsHomeUserMethodsListTestID"
        />
      ),
    [isError, userMethods, handleOnRetry]
  );

  if (!isLoading && !pot.isError(paymentMethodsPot) && isEmpty) {
    if (!shouldShowAddMethodsBanner) {
      return null;
    }

    return (
      <View style={{ paddingVertical: IOVisualCostants.appMarginDefault }}>
        <Banner
          testID="PaymentsHomeUserMethodsListTestID-banner"
          pictogramName="cardAdd"
          content={I18n.t("features.payments.methods.banner.content")}
          action={I18n.t("features.payments.methods.banner.action")}
          onPress={handleOnAddMethodPress}
          size="big"
          color="neutral"
          viewRef={bannerRef}
          labelClose={I18n.t("global.buttons.close")}
          onClose={() => dispatch(paymentsSetAddMethodsBannerVisible(false))}
        />
      </View>
    );
  }

  const showAddButton = !isError && !isLoading;

  return (
    <View>
      <ListItemHeader
        label={I18n.t("features.payments.methods.title")}
        accessibilityLabel={I18n.t("features.payments.methods.title")}
        endElement={
          showAddButton
            ? {
                type: "buttonLink",
                componentProps: {
                  label: I18n.t("features.payments.methods.button"),
                  onPress: handleOnAddMethodPress
                }
              }
            : undefined
        }
      />
      {isLoading && !pot.isError(paymentMethodsPot) ? (
        <PaymentCardsCarouselSkeleton testID="PaymentsHomeUserMethodsListTestID-loading" />
      ) : (
        PaymentCardsCarouselContent
      )}
      <VSpacer size={24} />
    </View>
  );
};

export { PaymentsHomeUserMethodsList };
