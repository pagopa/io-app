import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H3 } from "../../../components/core/typography/H3";
import { IOColors } from "../../../components/core/variables/IOColors";
import IconFont from "../../../components/ui/IconFont";
import { bpdEnabled } from "../../../config";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import {
  EnableableFunctionsTypeEnum,
  PaymentMethod
} from "../../../types/pagopa";
import BpdPaymentMethodCapability from "../../bonus/bpd/components/BpdPaymentMethodCapability";

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  icon: { alignSelf: "center" },
  row: { flex: 1, flexDirection: "row" }
});

const capabilityFactory = (
  paymentMethod: PaymentMethod,
  capability: EnableableFunctionsTypeEnum
) => {
  switch (capability) {
    case EnableableFunctionsTypeEnum.FA:
    case EnableableFunctionsTypeEnum.pagoPA:
      return null;
    case EnableableFunctionsTypeEnum.BPD:
      return bpdEnabled ? (
        <BpdPaymentMethodCapability paymentMethod={paymentMethod} />
      ) : null;
  }
};

const generateCapabilityItems = (paymentMethod: PaymentMethod) =>
  paymentMethod.enableableFunctions.reduce((acc, val): ReadonlyArray<
    React.ReactNode
  > => {
    const handlerForCapability = capabilityFactory(paymentMethod, val);
    return handlerForCapability === null ? acc : [...acc, handlerForCapability];
  }, [] as ReadonlyArray<React.ReactNode>);

/**
 * Display the capabilities available for a payment method
 * @param props
 * @constructor
 */
const PaymentMethodCapabilities: React.FunctionComponent<Props> = props => {
  const capabilityItems = generateCapabilityItems(props.paymentMethod);
  // The capability section is not rendered if there is not at least one capacity
  if (capabilityItems.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.row}>
        <IconFont
          name={"io-preferenze"}
          size={20}
          color={IOColors.bluegreyDark}
          style={styles.icon}
        />
        <View hspacer={true} />
        <H3 color={"bluegrey"}>{I18n.t("wallet.capability.title")}</H3>
      </View>
      <View spacer={true} />
      {capabilityItems.map(c => c)}
    </>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodCapabilities);
