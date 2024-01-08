import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import { WalletPaymentParamsList } from "../navigation/params";
import { walletPaymentDetailsSelector } from "../store/selectors";
import { WalletPaymentOutcome } from "../types/PaymentOutcomeEnum";

type WalletPaymentOutcomeScreenNavigationParams = {
  outcome: WalletPaymentOutcome;
};

type WalletPaymentOutcomeRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_OUTCOME"
>;

const WalletPaymentOutcomeScreen = () => {
  const { params } = useRoute<WalletPaymentOutcomeRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);

  const paymentAmount = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.map(({ amount }) => amount / 100),
    O.map(amount => formatNumberAmount(amount, true, "right")),
    O.getOrElse(() => "--")
  );

  const handleContinue = () => {
    navigation.popToTop();
    navigation.pop();
  };

  const handleBannerPress = () => {
    void mixpanelTrack("VOC_USER_EXIT", {
      screen_name: "PAYMENT_OUTCOMECODE_MESSAGE"
    });

    return openAuthenticationSession(
      "https://io.italia.it/diccilatua/ces-pagamento",
      ""
    );
  };

  const bannerViewRef = React.useRef<View>(null);

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("wallet.payment.outcome.success.title", {
        amount: paymentAmount
      })}
      action={{
        label: I18n.t("wallet.payment.outcome.success.button"),
        accessibilityLabel: I18n.t("wallet.payment.outcome.success.button"),
        onPress: handleContinue
      }}
    >
      <>
        <VSpacer size={24} />
        <Banner
          color="neutral"
          pictogramName="feedback"
          size="big"
          viewRef={bannerViewRef}
          title={I18n.t("wallet.outcomeMessage.payment.success.banner.title")}
          content={I18n.t(
            "wallet.outcomeMessage.payment.success.banner.content"
          )}
          action={I18n.t("wallet.outcomeMessage.payment.success.banner.action")}
          onPress={handleBannerPress}
        />
      </>
    </OperationResultScreenContent>
  );
};

export { WalletPaymentOutcomeScreen };
export type { WalletPaymentOutcomeScreenNavigationParams };
