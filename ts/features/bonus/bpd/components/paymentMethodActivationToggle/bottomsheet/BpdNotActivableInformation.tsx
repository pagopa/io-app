import * as React from "react";
import { View, StyleSheet } from "react-native";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { PaymentMethodRepresentation } from "../../../../../../types/pagopa";
import { PaymentMethodRepresentationComponent } from "../base/PaymentMethodRepresentationComponent";
import { useLegacyIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";

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
    backgroundColor: IOColors.white
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
    <View style={styles.body}>
      <VSpacer size={16} />
      <PaymentMethodRepresentationComponent {...props.representation} />
      <VSpacer size={16} />
      <Markdown>{getBody(props.type)}</Markdown>
    </View>
  );

export const useNotActivableInformationBottomSheet = (
  representation: PaymentMethodRepresentation,
  type: NotActivableType
) => {
  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <BpdNotActivableInformation type={type} representation={representation} />,
    getTitle(type),
    310
  );

  return { present, bottomSheet, dismiss };
};
