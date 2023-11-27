import {
  Body,
  GradientScrollView,
  H2,
  H3,
  HeaderSecondLevel,
  IOColors,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Barcode from "react-native-barcode-builder";
import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { LoadingIndicator } from "../../../../components/ui/LoadingIndicator";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayBarcodeExpireProgressBar } from "../components/BarcodeExpirationProgressBar";
import { IdPayBarcodeParamsList } from "../navigation/params";
import { idPayBarcodeByInitiativeIdSelector } from "../store";
import { calculateIdPayBarcodeSecondsToExpire } from "../utils";
import { idpayInitiativeDetailsSelector } from "../../details/store";

// -------------------- types --------------------

type IdPayBarcodeResultRouteParams = {
  initiativeId: string;
};
type IdPayBarcodeResultRouteProps = RouteProp<
  IdPayBarcodeParamsList,
  "IDPAY_BARCODE_RESULT"
>;
type SuccessContentProps = {
  goBack: () => void;
  barcode: TransactionBarCodeResponse;
};

// -------------------- main component --------------------

const IdPayBarcodeResultScreen = () => {
  const route = useRoute<IdPayBarcodeResultRouteProps>();
  const { initiativeId } = route.params;
  const navigation = useNavigation();
  const barcodePot = useIOSelector(state =>
    idPayBarcodeByInitiativeIdSelector(state)(initiativeId)
  );

  const navigateToInitiativeDetails = () =>
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      route: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      routeParams: { initiativeId }
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
          pictogram="umbrellaNew"
        />
      ),
      barcode => (
        <SuccessContent
          barcode={barcode}
          goBack={navigateToInitiativeDetails}
        />
      )
    )
  );
};

// -------------------- result screens --------------------

const SuccessContent = ({ goBack, barcode }: SuccessContentProps) => {
  const trx = barcode.trxCode.toUpperCase();
  const secondsTillExpire = React.useMemo(
    () => calculateIdPayBarcodeSecondsToExpire(barcode),
    [barcode]
  );
  const initiativeName = pipe(
    useIOSelector(idpayInitiativeDetailsSelector),
    pot.toOption,
    O.map(({ initiativeName }) => initiativeName),
    O.toUndefined
  );

  return (
    <>
      <HeaderSecondLevel
        backAccessibilityLabel={I18n.t("global.buttons.back")}
        title=""
        type="singleAction"
        firstAction={{
          icon: "closeLarge",
          accessibilityLabel: I18n.t("global.buttons.close"),
          onPress: goBack
        }}
        goBack={goBack}
      />
      <GradientScrollView
        primaryActionProps={{
          label: I18n.t("idpay.barCode.resultScreen.success.saveImageCta"),
          accessibilityLabel: I18n.t(
            "idpay.barCode.resultScreen.success.saveImageCta"
          ),
          onPress: () => null
        }}
        secondaryActionProps={{
          label: I18n.t("global.buttons.close"),
          accessibilityLabel: I18n.t("global.buttons.close"),
          onPress: goBack
        }}
      >
        <H2>{I18n.t("idpay.barCode.resultScreen.success.header")}</H2>
        <VSpacer size={16} />
        <Body>
          {I18n.t("idpay.barCode.resultScreen.success.body", {
            initiativeName
          })}
        </Body>
        <VSpacer size={24} />
        <View style={styles.barcodeContainer}>
          <Barcode format="CODE128" value={trx} />
          <H3 style={{ alignSelf: "center" }}>{trx}</H3>
          <VSpacer size={32} />
          <IdPayBarcodeExpireProgressBar
            secondsExpirationTotal={(barcode.trxExpirationMinutes ?? 0) * 60}
            secondsToExpiration={secondsTillExpire}
          />
        </View>
      </GradientScrollView>
    </>
  );
};

const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingWrapper}>
    <LoadingIndicator size={48} color="aqua" />
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
    borderColor: IOColors["grey-100"],
    borderWidth: 1,
    padding: 16,
    borderRadius: 8
  }
});

// -------------------- exports --------------------

export { IdPayBarcodeResultScreen };
export type { IdPayBarcodeResultRouteParams };
