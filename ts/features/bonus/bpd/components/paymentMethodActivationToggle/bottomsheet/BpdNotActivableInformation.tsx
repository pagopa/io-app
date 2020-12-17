import { View } from "native-base";
import * as React from "react";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";
import { PaymentMethodRepresentation } from "../../../../../../types/pagopa";
import { useIOBottomSheetRaw2 } from "../../../../../../utils/bottomSheet";
import { PaymentMethodRepresentationComponent } from "../base/PaymentMethodRepresentationComponent";

// NotActivable: already activated by someone else
// NotCompatible: missing bpd capability
export type NotActivableType = "NotActivable" | "NotCompatible";

type Props = {
  type: NotActivableType;
  representation: PaymentMethodRepresentation;
};

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

export const BpdNotActivableInformation: React.FunctionComponent<Props> = props => (
  <View>
    <View spacer={true} />
    <PaymentMethodRepresentationComponent {...props.representation} />
    <View spacer={true} />
    <Markdown>{getBody(props.type)}</Markdown>
  </View>
);

export const useNotActivableInformationBottomSheet = (
  representation: PaymentMethodRepresentation
) => {
  const { present, dismiss } = useIOBottomSheetRaw2(310);

  const openModalBox = async (type: NotActivableType) =>
    present(
      <BpdNotActivableInformation
        type={type}
        representation={representation}
      />,
      getTitle(type)
    );

  return { present: openModalBox, dismiss };
};
