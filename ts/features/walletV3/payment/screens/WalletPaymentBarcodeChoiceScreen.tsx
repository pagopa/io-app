import {
  ContentWrapper,
  Divider,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as A from "fp-ts/lib/Array";
import { contramap } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as N from "fp-ts/number";
import React from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { navigateToPaymentTransactionSummaryScreen } from "../../../../store/actions/navigation";
import {
  PaymentStartOrigin,
  paymentInitializeState
} from "../../../../store/actions/wallet/payment";
import { useIODispatch } from "../../../../store/hooks";
import { PagoPaBarcode } from "../../../barcode/types/IOBarcode";
import { PaymentNoticeListItem } from "../components/PaymentNoticeListItem";
import { WalletPaymentParamsList } from "../navigation/params";

type WalletPaymentBarcodeChoiceScreenParams = {
  barcodes: Array<PagoPaBarcode>;
  paymentStartOrigin: PaymentStartOrigin;
};

const sortByAmount = pipe(
  N.Ord,
  contramap((p: PagoPaBarcode) => parseFloat(p.amount))
);

const WalletPaymentBarcodeChoiceScreen = () => {
  const dispatch = useIODispatch();

  const route =
    useRoute<
      RouteProp<WalletPaymentParamsList, "WALLET_PAYMENT_BARCODE_CHOICE">
    >();

  const { barcodes, paymentStartOrigin } = route.params;

  const handleBarcodeSelected = (barcode: PagoPaBarcode) => {
    dispatch(paymentInitializeState());

    navigateToPaymentTransactionSummaryScreen({
      rptId: barcode.rptId,
      initialAmount: barcode.amount,
      paymentStartOrigin
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
          <H2>Sono stati rilevati più codici. Quale vuoi usare?</H2>
          <VSpacer size={32} />
          <FlatList
            scrollEnabled={false}
            data={sortedBarcodes}
            renderItem={({ item }) => renderBarcodeItem(item)}
            ItemSeparatorComponent={() => <Divider />}
          />
        </ContentWrapper>
      </ScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentBarcodeChoiceScreen };
export type { WalletPaymentBarcodeChoiceScreenParams };
