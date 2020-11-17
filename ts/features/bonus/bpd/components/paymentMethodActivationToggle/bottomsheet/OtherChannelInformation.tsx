import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { none } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { useContext } from "react";
import { NavigationContext } from "react-navigation";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { navigateToWalletAddPaymentMethod } from "../../../../../../store/actions/navigation";
import { bottomSheetContent } from "../../../../../../utils/bottomSheet";
import BlockButtons from "../../../../../../components/ui/BlockButtons";

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
      onPress,
      title: I18n.t(
        "bonus.bpd.details.paymentMethods.activateOnOthersChannel.addWallet"
      )
    }}
  />
);

export const OtherChannelInformation: React.FunctionComponent<Props> = props => (
  <View>
    <View spacer={true} />
    <Markdown>
      {I18n.t("bonus.bpd.details.paymentMethods.activateOnOthersChannel.body")}
    </Markdown>
    <View spacer={true} />
    <View spacer={true} />
    {addPaymentMethodButton(props.onAddPayment)}
  </View>
);

export const useOtherChannelInformationBottomSheet = () => {
  const { present, dismiss } = useBottomSheetModal();
  const navigation = useContext(NavigationContext);

  const openModalBox = async () => {
    const bottomSheetProps = await bottomSheetContent(
      <OtherChannelInformation
        onAddPayment={() => {
          dismiss();
          navigation.dispatch(
            navigateToWalletAddPaymentMethod({ inPayment: none })
          );
        }}
      />,
      I18n.t("bonus.bpd.details.paymentMethods.activateOnOthersChannel.title"),
      350,
      dismiss
    );
    present(bottomSheetProps.content, {
      ...bottomSheetProps.config
    });
  };
  return { present: openModalBox, dismiss };
};
