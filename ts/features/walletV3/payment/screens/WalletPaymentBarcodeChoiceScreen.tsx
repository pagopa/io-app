import {
  ContentWrapper,
  Divider,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import * as A from "fp-ts/lib/Array";
import { contramap } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as N from "fp-ts/number";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import {
  PaymentStartOrigin,
  paymentInitializeState
} from "../../../../store/actions/wallet/payment";
import { useIODispatch } from "../../../../store/hooks";
import * as analytics from "../../../barcode/analytics";
import { PagoPaBarcode } from "../../../barcode/types/IOBarcode";
import { PaymentNoticeListItem } from "../components/PaymentNoticeListItem";
import { WalletPaymentParamsList } from "../navigation/params";

type WalletPaymentBarcodeChoiceScreenParams = {
  barcodes: Array<PagoPaBarcode>;
};

const sortByAmount = pipe(
  N.Ord,
  contramap((p: PagoPaBarcode) => parseFloat(p.amount))
);

const WalletPaymentBarcodeChoiceScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  useFocusEffect(
    React.useCallback(() => {
      analytics.trackBarcodeMultipleCodesScreenView();
    }, [])
  );

  const route =
    useRoute<
      RouteProp<WalletPaymentParamsList, "WALLET_PAYMENT_BARCODE_CHOICE">
    >();

  const { barcodes } = route.params;

  const handleBarcodeSelected = (barcode: PagoPaBarcode) => {
    const paymentStartOrigin: PaymentStartOrigin =
      barcode.format === "DATA_MATRIX"
        ? "poste_datamatrix_scan"
        : "qrcode_scan";
    analytics.trackBarcodeMultipleCodesSelection();

    dispatch(paymentInitializeState());
    navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params: {
        initialAmount: barcode.amount,
        rptId: barcode.rptId,
        paymentStartOrigin
      }
    });
  };

  const renderBarcodeItem = (barcode: PagoPaBarcode) => {
    const paymentNoticeNumber = PaymentNoticeNumberFromString.encode(
      barcode.rptId.paymentNoticeNumber
    );

    return (
      <PaymentNoticeListItem
        paymentNoticeNumber={paymentNoticeNumber}
        organizationFiscalCode={barcode.rptId.organizationFiscalCode}
        amountInEuroCents={barcode.amount}
        onPress={() => handleBarcodeSelected(barcode)}
      />
    );
  };

  const sortedBarcodes = pipe(barcodes, A.sortBy([sortByAmount]), A.reverse);

  return (
    <BaseScreenComponent goBack={true}>
      <ScrollView>
        <ContentWrapper>
          <H2>{I18n.t("wallet.payment.barcodes.choice.title")}</H2>
          <VSpacer size={32} />
          {sortedBarcodes.map((item, index) => (
            <React.Fragment key={index}>
              {renderBarcodeItem(item)}
              {index <= sortedBarcodes.length - 2 && <Divider />}
            </React.Fragment>
          ))}
        </ContentWrapper>
      </ScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentBarcodeChoiceScreen };
export type { WalletPaymentBarcodeChoiceScreenParams };
