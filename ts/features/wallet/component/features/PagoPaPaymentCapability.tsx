import { Badge } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { H5 } from "../../../../components/core/typography/H5";
import { Link } from "../../../../components/core/typography/Link";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { PreferencesListItem } from "../../../../components/PreferencesListItem";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import Markdown from "../../../../components/ui/Markdown";
import Switch from "../../../../components/ui/Switch";
import I18n from "../../../../i18n";
import { PaymentMethod } from "../../../../types/pagopa";
import { PaymentSupportStatus } from "../../../../types/paymentMethodCapabilities";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { isPaymentSupported } from "../../../../utils/paymentMethodCapabilities";
import { openWebUrl } from "../../../../utils/url";
import PaymentStatusSwitch from "./PaymentStatusSwitch";

const styles = StyleSheet.create({
  badgeInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    height: 25,
    flexDirection: "row"
  },
  badgeArriving: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.blue,
    width: 65
  },
  bottomSheetCTA: {
    backgroundColor: IOColors.white,
    paddingRight: 0,
    paddingLeft: 0
  },
  badgeNotAvailable: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.blue,
    width: 130
  }
});

type Props = { paymentMethod: PaymentMethod };

const IN_APP_PAYMENTS_LEARN_MORE_VIDEO_URL =
  "https://io.italia.it/metodi-pagamento";

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
      return (
        <Badge style={[styles.badgeInfo, styles.badgeArriving]}>
          <H5 color="blue">{arriving}</H5>
        </Badge>
      );
    case "notAvailable":
      return (
        <Badge style={[styles.badgeNotAvailable, styles.badgeInfo]}>
          <H5 color="blue">{incompatible}</H5>
        </Badge>
      );
    case "onboardableNotImplemented":
      return <Switch testID={"switchOnboardCard"} disabled={true} />;
  }
};

/**
 * Represent the capability to pay in PagoPa of a payment method.
 *
 * We have 4 possible different cases:
 *   - The card can pay on IO -> has capability pagoPa
 *   - The card will be able to pay in the future on IO -> Satispay, BPay
 *   - The card is not able to pay on IO, (no pagoPa capability) and type === PRV or Bancomat
 *   - The card can onboard another card that can pay on IO -> co-badge credit card (no pagoPa capability) and type !== PRV
 * @param props
 */
const PagoPaPaymentCapability: React.FC<Props> = props => {
  const onOpenLearnMoreAboutInAppPayments = () =>
    openWebUrl(IN_APP_PAYMENTS_LEARN_MORE_VIDEO_URL);
  const paymentSupported = isPaymentSupported(props.paymentMethod);

  const { present, bottomSheet } = useIOBottomSheetModal(
    <View>
      <Markdown>
        {I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetBody")}
      </Markdown>
      <ButtonDefaultOpacity
        onPress={onOpenLearnMoreAboutInAppPayments}
        style={styles.bottomSheetCTA}
        onPressWithGestureHandler={true}
      >
        <Link>
          {I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetCTA")}
        </Link>
      </ButtonDefaultOpacity>
    </View>,
    I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetTitle"),
    200
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
          rightElement={availabilityBadge(
            paymentSupported,
            props.paymentMethod
          )}
        />
      </TouchableDefaultOpacity>
    </>
  );
};

export default PagoPaPaymentCapability;
