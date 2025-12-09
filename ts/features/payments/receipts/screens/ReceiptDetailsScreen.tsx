import { IOColors, useIOTheme, useIOToast } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import I18n from "i18next";
import { OriginEnum } from "../../../../../definitions/pagopa/biz-events/InfoNotice";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
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
  isCart?: boolean;
};

type ReceiptDetailsScreenProps = RouteProp<
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
  const { transactionId, isPayer, isCart } = route.params;
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
      user: paymentAnalyticsData?.receiptUser,
      organization_fiscal_code:
        paymentAnalyticsData?.receiptOrganizationFiscalCode
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
        paymentAnalyticsData?.receiptOrganizationFiscalCode,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser
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
        enableAnimatedPictogram
        pictogram="umbrella"
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
        loop
      />
    );
  }

  const showGenerateReceiptButton =
    transactionDetails?.infoNotice?.origin !== OriginEnum.PM && !isCart;

  return (
    <IOScrollView
      includeContentMargins={false}
      animatedRef={animatedScrollViewRef}
      actions={
        showGenerateReceiptButton
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
      <View style={[styles.wrapper, { backgroundColor }]}>
        {/* The following line is used to show the background color gray that overlay the basic one which is white */}
        <View style={[styles.bottomBackground, { backgroundColor }]} />
        <ReceiptHeadingSection
          transaction={transactionDetails}
          isLoading={isLoading}
        />
        <WalletTransactionInfoSection
          transaction={transactionDetails}
          showUnavailableReceiptBanner={!showGenerateReceiptButton}
          loading={isLoading}
        />
        <HideReceiptButton transactionId={transactionId} />
      </View>
    </IOScrollView>
  );
};

export { ReceiptDetailsScreen };
