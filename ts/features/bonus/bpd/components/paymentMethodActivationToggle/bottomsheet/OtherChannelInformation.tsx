import { none } from "fp-ts/lib/Option";
import { View } from "react-native";
import * as React from "react";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import BlockButtons from "../../../../../../components/ui/BlockButtons";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { navigateToWalletAddPaymentMethod } from "../../../../../../store/actions/navigation";
import { useLegacyIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";

// NotActivable: already activated by someone else
// NotCompatible: missing bpd capability
export type NotActivableType = "NotActivable" | "NotCompatible";

type Props = { onAddPayment: () => void };

const addPaymentMethodButton = (onPress: () => void) => (
  <BlockButtons
    type={"SingleButton"}
    leftButton={{
      onPressWithGestureHandler: true,
      block: true,
      primary: true,
      labelColor: IOColors.white,
      onPress,
      title: I18n.t(
        "bonus.bpd.details.paymentMethods.activateOnOthersChannel.addWallet"
      )
    }}
  />
);

export const OtherChannelInformation: React.FunctionComponent<
  Props
> = props => (
  <View>
    <VSpacer size={16} />
    <Markdown>
      {I18n.t("bonus.bpd.details.paymentMethods.activateOnOthersChannel.body")}
    </Markdown>
    <VSpacer size={32} />
    {addPaymentMethodButton(props.onAddPayment)}
  </View>
);

export const useOtherChannelInformationBottomSheet = () => {
  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <OtherChannelInformation
      onAddPayment={() => {
        dismiss();
        navigateToWalletAddPaymentMethod({ inPayment: none });
      }}
    />,
    I18n.t("bonus.bpd.details.paymentMethods.activateOnOthersChannel.title"),
    350
  );
  return { present, bottomSheet, dismiss };
};
