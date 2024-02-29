import * as React from "react";
import { StyleSheet, View, Switch } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { PreferencesListItem } from "../../../../components/PreferencesListItem";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { IOBadge } from "../../../../components/core/IOBadge";
import { Link } from "../../../../components/core/typography/Link";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { PaymentMethod } from "../../../../types/pagopa";
import { PaymentSupportStatus } from "../../../../types/paymentMethodCapabilities";
import { acceptedPaymentMethodsFaqUrl } from "../../../../urls";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { isPaymentSupported } from "../../../../utils/paymentMethodCapabilities";
import { openWebUrl } from "../../../../utils/url";
import PaymentStatusSwitch from "./PaymentStatusSwitch";

const styles = StyleSheet.create({
  bottomSheetCTA: {
    backgroundColor: IOColors.white,
    paddingRight: 0,
    paddingLeft: 0
  }
});

type Props = { paymentMethod: PaymentMethod };

const getLocales = () => ({
  available: I18n.t("wallet.methods.card.pagoPaCapability.active"),
  arriving: I18n.t("wallet.methods.card.pagoPaCapability.arriving"),
  incompatible: I18n.t("wallet.methods.card.pagoPaCapability.incompatible")
});

const availabilityBadge = (
  badgeType: PaymentSupportStatus,
  paymentMethod: PaymentMethod
) => {
  const { arriving, incompatible } = getLocales();
  switch (badgeType) {
    case "available":
      return <PaymentStatusSwitch paymentMethod={paymentMethod} />;
    case "arriving":
      return <IOBadge text={arriving} variant="outline" color="blue" />;
    case "notAvailable":
      return <IOBadge text={incompatible} variant="outline" color="blue" />;
    case "onboardableNotImplemented":
      return <Switch testID={"switchOnboardCard"} disabled={true} />;
  }
};

/**
 * Represent the capability to pay in PagoPa of a payment method.
 *
 * We have 4 possible different cases:
 *   - The card can pay on IO -> has capability pagoPa
 *   - The card will be able to pay in the future on IO -> BPay
 *   - The card is not able to pay on IO, (no pagoPa capability) and type === PRV or Bancomat
 *   - The card can onboard another card that can pay on IO -> co-badge credit card (no pagoPa capability) and type !== PRV
 * @param props
 */
const PagoPaPaymentCapability: React.FC<Props> = props => {
  const onOpenLearnMoreAboutInAppPayments = () =>
    openWebUrl(acceptedPaymentMethodsFaqUrl);
  const paymentSupported = isPaymentSupported(props.paymentMethod);

  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <View>
          <LegacyMarkdown>
            {I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetBody")}
          </LegacyMarkdown>
          <ButtonDefaultOpacity
            onPress={onOpenLearnMoreAboutInAppPayments}
            style={styles.bottomSheetCTA}
            onPressWithGestureHandler={true}
          >
            <Link>
              {I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetCTA")}
            </Link>
          </ButtonDefaultOpacity>
        </View>
      ),
      title: I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetTitle")
    },
    48
  );

  return (
    <>
      {bottomSheet}
      <TouchableDefaultOpacity
        onPress={paymentSupported === "available" ? undefined : present}
      >
        <PreferencesListItem
          testID={"PagoPaPaymentCapability"}
          title={I18n.t("wallet.methods.card.pagoPaCapability.title")}
          description={I18n.t(
            "wallet.methods.card.pagoPaCapability.description"
          )}
          rightElement={
            <View style={{ alignSelf: "flex-start" }}>
              {availabilityBadge(paymentSupported, props.paymentMethod)}
            </View>
          }
        />
      </TouchableDefaultOpacity>
    </>
  );
};

export default PagoPaPaymentCapability;
