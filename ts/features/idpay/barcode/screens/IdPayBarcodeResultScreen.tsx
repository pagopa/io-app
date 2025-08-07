import {
  Body,
  H3,
  IOColors,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState, useMemo } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Barcode from "react-native-barcode-builder";
import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { LoadingIndicator } from "../../../../components/ui/LoadingIndicator";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayBarcodeExpireProgressBar } from "../components/IdPayBarcodeExpireProgressBar";
import { IdPayBarcodeParamsList } from "../navigation/params";
import { idPayBarcodeByInitiativeIdSelector } from "../store";
import { idPayGenerateBarcode } from "../store/actions";
import { calculateIdPayBarcodeSecondsToExpire } from "../utils";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

// -------------------- types --------------------

type IdPayBarcodeResultRouteParams = {
  initiativeId: string;
};
type IdPayBarcodeResultRouteProps = RouteProp<
  IdPayBarcodeParamsList,
  "IDPAY_BARCODE_RESULT"
>;
type SuccessContentProps = {
  barcode: TransactionBarCodeResponse;
};
type BarcodeExpiredContentProps = {
  initiativeId: string;
};

// -------------------- main component --------------------

const IdPayBarcodeResultScreen = () => {
  const route = useRoute<IdPayBarcodeResultRouteProps>();
  const { initiativeId } = route.params;
  const navigation = useIONavigation();
  const barcodePot = useIOSelector(state =>
    idPayBarcodeByInitiativeIdSelector(state)(initiativeId)
  );

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  const navigateToInitiativeDetails = () =>
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: { initiativeId }
    });

  if (pot.isLoading(barcodePot)) {
    return <LoadingScreen />;
  }
  return pipe(
    barcodePot,
    pot.toOption,
    O.fold(
      () => (
        <OperationResultScreenContent
          title={I18n.t("idpay.barCode.resultScreen.error.generic.body")}
          action={{
            label: I18n.t("global.buttons.close"),
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: navigateToInitiativeDetails
          }}
          pictogram="umbrella"
          enableAnimatedPictogram
          loop
        />
      ),
      barcode => <SuccessContent barcode={barcode} />
    )
  );
};

// -------------------- result screens --------------------

const SuccessContent = ({ barcode }: SuccessContentProps) => {
  const trx = barcode.trxCode.toUpperCase();
  const [isBarcodeExpired, setIsBarcodeExpired] = useState(false);
  // expire check is handled by the progress bar
  // to avoid unnecessary rerenders, which could also be on the
  // heavier side due to barcode generation

  const secondsTillExpire = useMemo(
    () => calculateIdPayBarcodeSecondsToExpire(barcode),
    [barcode]
  );

  if (isBarcodeExpired) {
    return <BarcodeExpiredContent initiativeId={barcode.initiativeId} />;
  }
  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      actions={{
        type: "SingleButton",
        primary: {
          icon: "copy",
          iconPosition: "end",
          label: I18n.t("idpay.barCode.resultScreen.success.copyCodeCta"),
          accessibilityLabel: I18n.t(
            "idpay.barCode.resultScreen.success.copyCodeCta"
          ),
          onPress: () => clipboardSetStringWithFeedback(trx)
        }
      }}
      title={{
        label: I18n.t("idpay.barCode.resultScreen.success.header")
      }}
      description={I18n.t("idpay.barCode.resultScreen.success.body", {
        initiativeName: barcode.initiativeName
      })}
    >
      <View style={styles.barcodeContainer}>
        <VSpacer size={4} />
        <Barcode format="CODE128" value={trx} />
        <H3 style={{ alignSelf: "center" }}>{trx}</H3>
        <VSpacer size={32} />
        <IdPayBarcodeExpireProgressBar
          secondsExpirationTotal={barcode.trxExpirationSeconds}
          secondsToExpiration={secondsTillExpire}
          setIsExpired={setIsBarcodeExpired}
        />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

const BarcodeExpiredContent = ({
  initiativeId
}: BarcodeExpiredContentProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const { goBack } = navigation;
  const ctaClickHandler = () => {
    dispatch(idPayGenerateBarcode.request({ initiativeId }));
  };
  return (
    <OperationResultScreenContent
      isHeaderVisible
      title={I18n.t("idpay.barCode.resultScreen.success.expired.header")}
      action={{
        label: I18n.t("idpay.barCode.resultScreen.success.expired.CTA"),
        accessibilityLabel: I18n.t(
          "idpay.barCode.resultScreen.success.expired.CTA"
        ),
        onPress: ctaClickHandler
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: goBack
      }}
      pictogram="timing"
    />
  );
};

const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingWrapper}>
    <LoadingIndicator />
    <VSpacer size={24} />
    <H3>{I18n.t("idpay.barCode.resultScreen.loading.body")}</H3>
    <VSpacer size={8} />
    <Body>{I18n.t("idpay.barCode.resultScreen.loading.subtitle")}</Body>
  </SafeAreaView>
);

// error screen content will go here, once error mapping
// is completely defined

// -------------------- styles --------------------

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    justifyContent: "center",
    alignItems: "center"
  },
  barcodeContainer: {
    /* TODO: Dark mode: Replace with theme values */
    borderColor: IOColors["grey-100"],
    borderWidth: 1,
    padding: 16,
    borderRadius: 8
  }
});

// -------------------- exports --------------------

export { IdPayBarcodeResultScreen };
export type { IdPayBarcodeResultRouteParams };
