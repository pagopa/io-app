import { useBottomSheetModal, TouchableOpacity } from "@gorhom/bottom-sheet";
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
import { isIos } from "../../../../../../utils/platform";

// NotActivable: already activated by someone else
// NotCompatible: missing bpd capability
export type NotActivableType = "NotActivable" | "NotCompatible";

type Props = { onAddPayment: () => void };

const styles = StyleSheet.create({
  button: {
    width: "100%"
  }
});

// A very quick fix for android
const addPaymentMethodButton = (onPress: () => void) => {
  const button = (
    <Button style={styles.button} onPress={isIos ? onPress : undefined}>
      <Label color={"white"}>
        {I18n.t(
          "bonus.bpd.details.paymentMethods.activateOnOthersChannel.addWallet"
        )}
      </Label>
    </Button>
  );

  return !isIos ? (
    <TouchableOpacity onPress={onPress}>{button}</TouchableOpacity>
  ) : (
    button
  );
};

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
