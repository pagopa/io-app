import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { PaymentMethodRepresentation } from "../../../../../../types/pagopa";
import { PaymentMethodRepresentationComponent } from "../base/PaymentMethodRepresentationComponent";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";

// NotActivable: already activated by someone else
// NotCompatible: missing bpd capability
export type NotActivableType = "NotActivable" | "NotCompatible";

type Props = {
  type: NotActivableType;
  representation: PaymentMethodRepresentation;
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "white"
  }
});

const getBody = (type: NotActivableType) => {
  switch (type) {
    case "NotActivable":
      return I18n.t("bonus.bpd.details.paymentMethods.notActivable.body");
    case "NotCompatible":
      return I18n.t("bonus.bpd.details.paymentMethods.notCompatible.body");
  }
};

const getTitle = (type: NotActivableType) => {
  switch (type) {
    case "NotActivable":
      return I18n.t("bonus.bpd.details.paymentMethods.notActivable.title");
    case "NotCompatible":
      return I18n.t("bonus.bpd.details.paymentMethods.notCompatible.title");
  }
};

export const BpdNotActivableInformation: React.FunctionComponent<Props> =
  props => (
    <View style={[styles.body, IOStyles.horizontalContentPadding]}>
      <View spacer={true} />
      <PaymentMethodRepresentationComponent {...props.representation} />
      <View spacer={true} />
      <Markdown>{getBody(props.type)}</Markdown>
    </View>
  );

export const useNotActivableInformationBottomSheet = (
  representation: PaymentMethodRepresentation,
  type: NotActivableType
) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <BpdNotActivableInformation type={type} representation={representation} />,
    getTitle(type),
    310
  );

  return { present, bottomSheet, dismiss };
};
