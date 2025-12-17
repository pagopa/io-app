import {
  Body,
  H3,
  h3FontSize,
  h3LineHeight,
  IOColors,
  IOText,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Barcode from "react-native-barcode-builder";
import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { LoadingIndicator } from "../../../../components/ui/LoadingIndicator";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  trackIDPayDetailCodeExpired,
  trackIDPayDetailCodeGenerateNew,
  trackIDPayDetailCodeGenerationConversion,
  trackIDPayDetailCodeGenerationCopy,
  trackIDPayDetailCodeGenerationError
} from "../../details/analytics";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { idpayInitiativeDetailsSelector } from "../../details/store";
import { IdPayBarcodeExpireProgressBar } from "../components/IdPayBarcodeExpireProgressBar";
import { IdPayBarcodeParamsList } from "../navigation/params";

import { idPayGenerateBarcode } from "../store/actions";
import { idPayBarcodeByInitiativeIdSelector } from "../store/selectors";

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
  initiativeId: string;
  initiativeName?: string;
};
type BarcodeExpiredContentProps = {
  initiativeId: string;
  initiativeName?: string;
};

// -------------------- main component --------------------

const IdPayBarcodeResultScreen = () => {
  const route = useRoute<IdPayBarcodeResultRouteProps>();
  const { initiativeId } = route.params;
  const barcodePot = useIOSelector(state =>
    idPayBarcodeByInitiativeIdSelector(state)(initiativeId)
  );

  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);

  const initiativeName = pot.getOrElse(
    pot.map(initiativeDataPot, initiative => initiative.initiativeName),
    undefined
  );

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  if (pot.isLoading(barcodePot)) {
    return <LoadingScreen />;
  }
  return pipe(
    barcodePot,
    pot.toOption,
    O.fold(
      () => (
        <FailureContent
          initiativeId={initiativeId}
          initiativeName={initiativeName}
        />
      ),
      barcode => (
        <SuccessContent
          barcode={barcode}
          initiativeId={initiativeId}
          initiativeName={initiativeName}
        />
      )
    )
  );
};

// -------------------- result screens --------------------

const FailureContent = ({
  initiativeId,
  initiativeName
}: Omit<SuccessContentProps, "barcode">) => {
  const navigation = useIONavigation();

  const navigateToInitiativeDetails = () =>
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: { initiativeId }
    });

  useOnFirstRender(() => {
    trackIDPayDetailCodeGenerationError({
      initiativeId,
      initiativeName
    });
  });

  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={I18n.t("idpay.barCode.resultScreen.error.generic.body")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: navigateToInitiativeDetails
      }}
    />
  );
};

const SuccessContent = ({
  barcode,
  initiativeId,
  initiativeName
}: SuccessContentProps) => {
  const trx = barcode.trxCode.toUpperCase();

  useOnFirstRender(() => {
    trackIDPayDetailCodeGenerationConversion({
      initiativeId,
      initiativeName
    });
  });

  const [isBarcodeExpired, setIsBarcodeExpired] = useState(false);

  useEffect(() => {
    if (isBarcodeExpired) {
      trackIDPayDetailCodeExpired({
        initiativeId,
        initiativeName
      });
    }
  }, [initiativeId, initiativeName, isBarcodeExpired]);

  if (isBarcodeExpired) {
    return (
      <BarcodeExpiredContent
        initiativeId={barcode.initiativeId}
        initiativeName={initiativeName}
      />
    );
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
          onPress: () => {
            trackIDPayDetailCodeGenerationCopy({
              initiativeId,
              initiativeName
            });
            clipboardSetStringWithFeedback(trx);
          }
        }
      }}
      title={{
        label: I18n.t("idpay.barCode.resultScreen.success.header")
      }}
      description={I18n.t("idpay.barCode.resultScreen.success.body")}
    >
      <View style={styles.barcodeContainer}>
        <VSpacer size={4} />
        <Barcode format="CODE128" value={trx} />
        <View style={{ alignItems: "center" }}>
          <IOText
            font="FiraCode"
            size={h3FontSize}
            lineHeight={h3LineHeight}
            weight="Medium"
          >
            {trx}
          </IOText>
        </View>
        <VSpacer size={32} />
        <IdPayBarcodeExpireProgressBar
          barcode={barcode}
          secondsExpirationTotal={barcode.trxExpirationSeconds}
          setIsExpired={setIsBarcodeExpired}
        />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

const BarcodeExpiredContent = ({
  initiativeId,
  initiativeName
}: BarcodeExpiredContentProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const { goBack } = navigation;
  const ctaClickHandler = () => {
    trackIDPayDetailCodeGenerateNew({
      initiativeId,
      initiativeName
    });

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
