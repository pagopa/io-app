import { ContentWrapper, Divider } from "@pagopa/io-app-design-system";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { NewH2 } from "../../../../components/core/typography/NewH2";
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

  return (
    <BaseScreenComponent goBack={true}>
      <ScrollView>
        <ContentWrapper>
          <NewH2>Sono stati rilevati più codici. Quale vuoi usare?</NewH2>
          <VSpacer size={32} />
          <FlatList
            scrollEnabled={false}
            data={barcodes}
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
