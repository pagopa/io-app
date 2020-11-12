import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { none } from "fp-ts/lib/Option";
import { Button, View } from "native-base";
import * as React from "react";
import { useContext } from "react";
import { StyleSheet } from "react-native";
import { NavigationContext } from "react-navigation";
import { Label } from "../../../../../../components/core/typography/Label";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { navigateToWalletAddPaymentMethod } from "../../../../../../store/actions/navigation";
import { bottomSheetContent } from "../../../../../../utils/bottomSheet";

// NotActivable: already activated by someone else
// NotCompatible: missing bpd capability
export type NotActivableType = "NotActivable" | "NotCompatible";

type Props = { onAddPayment: () => void };

const styles = StyleSheet.create({
  button: {
    width: "100%"
  }
});

export const OtherChannelInformation: React.FunctionComponent<Props> = props => (
  <View>
    <View spacer={true} />
    <Markdown>
      {I18n.t("bonus.bpd.details.paymentMethods.activateOnOthersChannel.body")}
    </Markdown>
    <View spacer={true} />
    <View spacer={true} />
    <Button style={styles.button} onPress={props.onAddPayment}>
      <Label color={"white"}>
        {I18n.t(
          "bonus.bpd.details.paymentMethods.activateOnOthersChannel.addWallet"
        )}
      </Label>
    </Button>
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
