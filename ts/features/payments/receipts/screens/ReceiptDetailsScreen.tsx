import { IOColors, useIOTheme, useIOToast } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { OriginEnum } from "../../../../../definitions/pagopa/biz-events/InfoNotice";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { FAQsCategoriesType } from "../../../../utils/faq";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import HideReceiptButton from "../components/HideReceiptButton";
import { ReceiptHeadingSection } from "../components/ReceiptHeadingSection";
import WalletTransactionInfoSection from "../components/ReceiptInfoSection";
import { PaymentsReceiptParamsList } from "../navigation/params";
import { PaymentsReceiptRoutes } from "../navigation/routes";
import {
  getPaymentsReceiptDetailsAction,
  getPaymentsReceiptDownloadAction
} from "../store/actions";
import {
  walletReceiptDetailsPotSelector,
  walletReceiptPotSelector
} from "../store/selectors";

export type ReceiptDetailsScreenParams = {
  transactionId: string;
  isPayer?: boolean;
};

export type ReceiptDetailsScreenProps = RouteProp<
  PaymentsReceiptParamsList,
  "PAYMENT_RECEIPT_DETAILS"
>;

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  bottomBackground: {
    position: "absolute",
    height: windowHeight,
    bottom: -windowHeight,
    left: 0,
    right: 0,
    backgroundColor: IOColors["grey-50"]
  },
  wrapper: {
    flexGrow: 1,
    alignContent: "flex-start",
    backgroundColor: IOColors["grey-50"]
  }
});

const ReceiptDetailsScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const route = useRoute<ReceiptDetailsScreenProps>();
  const { transactionId, isPayer } = route.params;
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const transactionDetailsPot = useIOSelector(walletReceiptDetailsPotSelector);
  const transactionReceiptPot = useIOSelector(walletReceiptPotSelector);
  const toast = useIOToast();

  const isLoading = pot.isLoading(transactionDetailsPot);
  const isLoadingReceipt = pot.isLoading(transactionReceiptPot);
  const isError = pot.isError(transactionDetailsPot);
  const transactionDetails = pot.toUndefined(transactionDetailsPot);
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-secondary"]];

  useOnFirstRender(() => {
    fetchTransactionDetails();
  });

  const fetchTransactionDetails = () => {
    dispatch(
      getPaymentsReceiptDetailsAction.request({
        transactionId,
        isPayer
      })
    );
  };

  const handleOnDownloadPdfReceiptError = () => {
    analytics.trackPaymentsDownloadReceiptError({
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser
    });
    toast.error(I18n.t("features.payments.transactions.receipt.error"));
  };

  const handleOnDownloadPdfReceiptSuccess = () => {
    navigation.navigate(PaymentsReceiptRoutes.PAYMENT_RECEIPT_NAVIGATOR, {
      screen: PaymentsReceiptRoutes.PAYMENT_RECEIPT_PREVIEW_SCREEN
    });
  };

  const handleDownloadPdfReceipt = () => {
    analytics.trackPaymentsDownloadReceiptAction({
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser,
      payment_status: "paid"
    });
    dispatch(
      getPaymentsReceiptDownloadAction.request({
        transactionId,
        onError: handleOnDownloadPdfReceiptError,
        onSuccess: handleOnDownloadPdfReceiptSuccess
      })
    );
  };

  useHeaderSecondLevel({
    title:
      transactionDetails?.carts?.[0].payee?.name ??
      I18n.t("transaction.details.title"),
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    faqCategories: ["wallet_transaction" as FAQsCategoriesType],
    supportRequest: true
  });

  if (isError) {
    return (
      <OperationResultScreenContent
        pictogram="umbrellaNew"
        title={I18n.t("transaction.details.error.title")}
        action={{
          label: I18n.t("global.buttons.retry"),
          accessibilityLabel: I18n.t("global.buttons.retry"),
          onPress: fetchTransactionDetails
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.back"),
          accessibilityLabel: I18n.t("global.buttons.back"),
          onPress: navigation.goBack
        }}
      />
    );
  }

  return (
    <IOScrollView
      includeContentMargins={false}
      animatedRef={animatedScrollViewRef}
      actions={
        transactionDetails?.infoNotice?.origin !== OriginEnum.PM
          ? {
              type: "SingleButton",
              primary: {
                label: I18n.t(
                  "features.payments.transactions.receipt.download"
                ),
                onPress: handleDownloadPdfReceipt,
                loading: isLoadingReceipt,
                disabled: isLoadingReceipt
              }
            }
          : undefined
      }
    >
      <FocusAwareStatusBar barStyle={"dark-content"} />
      <View style={[styles.wrapper, { backgroundColor }]}>
        {/* The following line is used to show the background color gray that overlay the basic one which is white */}
        <View style={[styles.bottomBackground, { backgroundColor }]} />
        <ReceiptHeadingSection
          transaction={transactionDetails}
          isLoading={isLoading}
        />
        <WalletTransactionInfoSection
          transaction={transactionDetails}
          loading={isLoading}
        />
        <HideReceiptButton transactionId={transactionId} />
      </View>
    </IOScrollView>
  );
};

export { ReceiptDetailsScreen };
