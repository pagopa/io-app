import {
  ContentWrapper,
  Divider,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as A from "fp-ts/lib/Array";
import { contramap } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as N from "fp-ts/number";
import { useCallback, Fragment } from "react";
import { ScrollView } from "react-native-gesture-handler";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import * as analytics from "../../../barcode/analytics";
import { PagoPaBarcode } from "../../../barcode/types/IOBarcode";
import { usePagoPaPayment } from "../../checkout/hooks/usePagoPaPayment";
import { PaymentNoticeListItem } from "../components/PaymentNoticeListItem";
import { PaymentsBarcodeParamsList } from "../navigation/params";

type PaymentsBarcodeChoiceScreenParams = {
  barcodes: Array<PagoPaBarcode>;
};

const sortByAmount = pipe(
  N.Ord,
  contramap((p: PagoPaBarcode) => parseFloat(p.amount))
);

const PaymentsBarcodeChoiceScreen = () => {
  const { startPaymentFlowWithRptId } = usePagoPaPayment();

  useFocusEffect(
    useCallback(() => {
      analytics.trackBarcodeMultipleCodesScreenView();
    }, [])
  );

  const route =
    useRoute<RouteProp<PaymentsBarcodeParamsList, "PAYMENT_BARCODE_CHOICE">>();

  const { barcodes } = route.params;

  const handleBarcodeSelected = (barcode: PagoPaBarcode) => {
    const paymentStartOrigin =
      barcode.format === "DATA_MATRIX"
        ? "poste_datamatrix_scan"
        : "qrcode_scan";
    analytics.trackBarcodeMultipleCodesSelection();

    startPaymentFlowWithRptId(barcode.rptId, {
      onSuccess: "showTransaction",
      startOrigin: paymentStartOrigin
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
            <Fragment key={index}>
              {renderBarcodeItem(item)}
              {index <= sortedBarcodes.length - 2 && <Divider />}
            </Fragment>
          ))}
        </ContentWrapper>
      </ScrollView>
    </BaseScreenComponent>
  );
};

export { PaymentsBarcodeChoiceScreen };
export type { PaymentsBarcodeChoiceScreenParams };
