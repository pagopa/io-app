import * as React from "react";
import { View } from "react-native";
import {
  ButtonLink,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import { constVoid } from "fp-ts/lib/function";

import { hasPaymentFeature, isPaymentSupported } from "../utils";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { acceptedPaymentMethodsFaqUrl } from "../../../../urls";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";

type Props = { paymentMethod: WalletInfo };

const getLocales = () => ({
  available: I18n.t("wallet.methods.card.pagoPaCapability.active"),
  arriving: I18n.t("wallet.methods.card.pagoPaCapability.arriving"),
  notAvailable: I18n.t("wallet.methods.card.pagoPaCapability.incompatible"),
  onboardableNotImplemented: I18n.t(
    "wallet.methods.card.pagoPaCapability.incompatible"
  )
});

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
const WalletDetailsPagoPaPaymentCapability: React.FC<Props> = props => {
  const onOpenLearnMoreAboutInAppPayments = () =>
    openWebUrl(acceptedPaymentMethodsFaqUrl);
  const paymentSupported = isPaymentSupported(props.paymentMethod);

  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <View>
          <Markdown>
            {I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetBody")}
          </Markdown>
          <VSpacer size={24} />
          <ButtonLink
            label={I18n.t(
              "wallet.methods.card.pagoPaCapability.bottomSheetCTA"
            )}
            onPress={onOpenLearnMoreAboutInAppPayments}
          />
        </View>
      ),
      title: I18n.t("wallet.methods.card.pagoPaCapability.bottomSheetTitle")
    },
    80
  );

  return (
    <>
      {bottomSheet}
      <TouchableDefaultOpacity
        onPress={paymentSupported === "available" ? undefined : present}
      >
        {paymentSupported === "available" && (
          <ListItemSwitch
            label={I18n.t("wallet.methods.card.pagoPaCapability.title")}
            description={I18n.t(
              "wallet.methods.card.pagoPaCapability.description"
            )}
            value={hasPaymentFeature(props.paymentMethod)}
            // TODO: Handling the possibility to enable/disable to pay with this payment method in app switching the toggle (PATCH request) - https://pagopa.atlassian.net/browse/IOBP-405
            onSwitchValueChange={() => constVoid}
          />
        )}
        {paymentSupported !== "available" && (
          <ListItemSwitch
            label={I18n.t("wallet.methods.card.pagoPaCapability.title")}
            description={I18n.t(
              "wallet.methods.card.pagoPaCapability.description"
            )}
            badge={{
              text: getLocales()[paymentSupported],
              variant: "blue",
              outline: true,
              testID: "paymentMethodStatusBadge"
            }}
          />
        )}
      </TouchableDefaultOpacity>
    </>
  );
};

export default WalletDetailsPagoPaPaymentCapability;
