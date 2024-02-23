import {
  Body,
  Divider,
  GradientScrollView,
  H3,
  IOSpacingScale,
  ListItemInfo,
  ListItemInfoCopy,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumberFromString,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { ComponentProps, useLayoutEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { FaultCategoryEnum } from "../../../../../definitions/pagopa/ecommerce/FaultCategory";
import { GatewayFaultEnum } from "../../../../../definitions/pagopa/ecommerce/GatewayFault";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { format } from "../../../../utils/dates";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { cleanTransactionDescription } from "../../../../utils/payment";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { WalletPaymentFailureDetail } from "../components/WalletPaymentFailureDetail";
import { WalletPaymentParamsList } from "../navigation/params";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentGetDetails } from "../store/actions/networking";
import { walletPaymentDetailsSelector } from "../store/selectors";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";

type WalletPaymentDetailScreenNavigationParams = {
  rptId: RptId;
};

type WalletPaymentDetailRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_DETAIL"
>;

const WalletPaymentDetailScreen = () => {
  const { params } = useRoute<WalletPaymentDetailRouteProps>();
  const { rptId } = params;

  const dispatch = useIODispatch();
  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetDetails.request(rptId));
    }, [dispatch, rptId])
  );

  if (pot.isError(paymentDetailsPot)) {
    const failure = pipe(
      paymentDetailsPot.error,
      WalletPaymentFailure.decode,
      O.fromEither,
      // NetworkError is transformed to GENERIC_ERROR only for display purposes
      O.getOrElse<WalletPaymentFailure>(() => ({
        faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR,
        faultCodeDetail: GatewayFaultEnum.GENERIC_ERROR
      }))
    );
    return <WalletPaymentFailureDetail failure={failure} />;
  }

  if (pot.isSome(paymentDetailsPot)) {
    return (
      <WalletPaymentDetailContent
        rptId={rptId}
        payment={paymentDetailsPot.value}
      />
    );
  }

  return (
    <SafeAreaView style={styles.loadingContainer}>
      <LoadingSpinner size={48} />
      <VSpacer size={24} />
      <H3 style={{ textAlign: "center" }}>
        {I18n.t("wallet.firstTransactionSummary.loading")}
      </H3>
    </SafeAreaView>
  );
};

type WalletPaymentDetailContentProps = {
  rptId: RptId;
  payment: PaymentRequestsGetResponse;
};

const WalletPaymentDetailContent = ({
  rptId,
  payment
}: WalletPaymentDetailContentProps) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelp: emptyContextualHelp
  });

  const navigateToMakePaymentScreen = () => {
    navigation.push(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_MAKE
    });
  };

  const amountInfoBottomSheet = useIOBottomSheetAutoresizableModal({
    title: I18n.t("wallet.firstTransactionSummary.amountInfo.title"),
    component: (
      <SafeAreaView>
        <Body>
          {I18n.t("wallet.firstTransactionSummary.amountInfo.message")}
        </Body>
        <VSpacer size={24} />
      </SafeAreaView>
    )
  });

  const description = pipe(
    payment.description,
    O.fromNullable,
    O.map(cleanTransactionDescription),
    O.toUndefined
  );

  const amount = pipe(payment.amount, centsToAmount, amount =>
    formatNumberAmount(amount, true, "right")
  );

  const dueDate = pipe(
    payment.dueDate,
    O.fromNullable,
    O.map(_ => format(_, "DD/MM/YYYY")),
    O.toUndefined
  );

  const formattedPaymentNoticeNumber = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ paymentNoticeNumber }) => paymentNoticeNumber),
    O.map(PaymentNoticeNumberFromString.encode),
    O.map(_ => _.replace(/(\d{4})/g, "$1  ").trim()),
    O.getOrElse(() => "")
  );

  const organizationFiscalCode = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ organizationFiscalCode }) => organizationFiscalCode),
    O.map(OrganizationFiscalCode.encode),
    O.getOrElse(() => "")
  );

  const amountEndElement: ComponentProps<typeof ListItemInfo>["endElement"] = {
    type: "iconButton",
    componentProps: {
      icon: "info",
      accessibilityLabel: "info",
      onPress: amountInfoBottomSheet.present
    }
  };

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Vai al pagamento",
        accessibilityLabel: "Vai al pagmento",
        onPress: navigateToMakePaymentScreen
      }}
    >
      <ListItemInfo
        icon={"institution"}
        label={I18n.t("wallet.firstTransactionSummary.recipient")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.recipient")}
        value={payment.paName}
      />
      <Divider />
      <ListItemInfo
        icon={"notes"}
        label={I18n.t("wallet.firstTransactionSummary.object")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.object")}
        value={description}
      />
      <Divider />
      <ListItemInfo
        icon={"psp"}
        label={I18n.t("wallet.firstTransactionSummary.amount")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.amount")}
        value={amount}
        endElement={amountEndElement}
      />
      <Divider />
      <ListItemInfo
        icon="calendar"
        label={I18n.t("wallet.firstTransactionSummary.dueDate")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.dueDate")}
        value={dueDate}
      />
      <Divider />
      <ListItemInfoCopy
        icon="docPaymentCode"
        label={I18n.t("payment.noticeCode")}
        accessibilityLabel={I18n.t("payment.noticeCode")}
        value={formattedPaymentNoticeNumber}
        onPress={() =>
          clipboardSetStringWithFeedback(formattedPaymentNoticeNumber)
        }
      />
      <Divider />
      <ListItemInfoCopy
        icon="entityCode"
        label={I18n.t("wallet.firstTransactionSummary.entityCode")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.entityCode")}
        value={organizationFiscalCode}
        onPress={() => clipboardSetStringWithFeedback(organizationFiscalCode)}
      />
      {amountInfoBottomSheet.bottomSheet}
    </GradientScrollView>
  );
};

const loadingContainerHorizontalMargin: IOSpacingScale = 48;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: loadingContainerHorizontalMargin
  }
});

export { WalletPaymentDetailScreen };
export type { WalletPaymentDetailScreenNavigationParams };
