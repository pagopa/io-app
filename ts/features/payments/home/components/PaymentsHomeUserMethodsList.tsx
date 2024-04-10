import {
  Banner,
  IOVisualCostants,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
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
import {
  PaymentCardsCarousel,
  PaymentCardsCarouselSkeleton
} from "./PaymentsCardsCarousel";

type Props = {
  enforcedLoadingState?: boolean;
};

const PaymentsHomeUserMethodsList = ({ enforcedLoadingState }: Props) => {
  const bannerRef = React.createRef<View>();

  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const shouldShowAddMethodsBanner = useIOSelector(
    isAddMethodsBannerVisibleSelector
  );
  const paymentMethodsPot = useIOSelector(paymentsWalletUserMethodsSelector);
  const paymentMethods = pot.getOrElse(paymentMethodsPot, []);

  const isLoading = pot.isLoading(paymentMethodsPot) || enforcedLoadingState;
  const isEmpty = paymentMethods.length === 0;

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getPaymentsWalletUserMethods.request());
    }, [dispatch])
  );

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
    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  const userMethods = paymentMethods.map(
    (method: WalletInfo): PaymentCardSmallProps => ({
      ...getPaymentCardPropsFromWalletInfo(method),
      onPress: handleOnMethodPress(method.walletId)
    })
  );

  if (!isLoading && isEmpty) {
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
          onPress={() => undefined}
          size="big"
          color="neutral"
          viewRef={bannerRef}
          labelClose={I18n.t("global.buttons.close")}
          onClose={() => dispatch(paymentsSetAddMethodsBannerVisible(false))}
        />
      </View>
    );
  }

  return (
    <View>
      <ListItemHeader
        label={I18n.t("features.payments.methods.title")}
        accessibilityLabel={I18n.t("features.payments.methods.title")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("features.payments.methods.button"),
            onPress: handleOnAddMethodPress
          }
        }}
      />
      {isLoading ? (
        <PaymentCardsCarouselSkeleton testID="PaymentsHomeUserMethodsListTestID-loading" />
      ) : (
        <PaymentCardsCarousel
          cards={userMethods}
          testID="PaymentsHomeUserMethodsListTestID"
        />
      )}
      <VSpacer size={24} />
    </View>
  );
};

export { PaymentsHomeUserMethodsList };
