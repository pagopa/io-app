import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { BpdConfig } from "../../../../../definitions/content/BpdConfig";
import Initiative from "../../../../../img/wallet/initiatives.svg";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { bpdEnabled } from "../../../../config";
import I18n from "../../../../i18n";
import { bpdRemoteConfigSelector } from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import {
  EnableableFunctionsTypeEnum,
  PaymentMethod
} from "../../../../types/pagopa";
import BpdPaymentMethodCapability from "../../../bonus/bpd/components/BpdPaymentMethodCapability";

type OwnProps = {
  paymentMethod: PaymentMethod;
} & Pick<React.ComponentProps<typeof View>, "style">;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  icon: { alignSelf: "center" },
  row: { flex: 1, flexDirection: "row" }
});

const capabilityFactory = (
  paymentMethod: PaymentMethod,
  capability: EnableableFunctionsTypeEnum,
  index: number,
  bpdRemoteConfig?: BpdConfig
) => {
  switch (capability) {
    case EnableableFunctionsTypeEnum.FA:
    case EnableableFunctionsTypeEnum.pagoPA:
      return null;
    case EnableableFunctionsTypeEnum.BPD:
      return bpdEnabled && bpdRemoteConfig?.program_active ? (
        <View key={`capability_item_${index}`}>
          <BpdPaymentMethodCapability paymentMethod={paymentMethod} />
          <ItemSeparatorComponent noPadded={true} />
        </View>
      ) : null;
  }
};

/** *
 * Extracts the capabilities from a {@link PaymentMethod}, based on the enableableFunctions
 * @param paymentMethod
 * @param bpdRemoteConfig
 */
const generateCapabilityItems = (
  paymentMethod: PaymentMethod,
  bpdRemoteConfig?: BpdConfig
): ReadonlyArray<React.ReactNode> =>
  paymentMethod.enableableFunctions.reduce((acc, val, i): ReadonlyArray<
    React.ReactNode
  > => {
    const handlerForCapability = capabilityFactory(
      paymentMethod,
      val,
      i,
      bpdRemoteConfig
    );
    return handlerForCapability === null ? acc : [...acc, handlerForCapability];
  }, [] as ReadonlyArray<React.ReactNode>);

/**
 * This component enlists the different initiatives active on the payment methods
 * @param props
 * @constructor
 */
const PaymentMethodInitiatives = (props: Props): React.ReactElement | null => {
  const capabilityItems = generateCapabilityItems(
    props.paymentMethod,
    props.bpdRemoteConfig
  );
  return capabilityItems.length > 0 ? (
    <View style={props.style}>
      <View style={styles.row}>
        <Initiative
          width={20}
          height={20}
          stroke={IOColors.bluegreyDark}
          style={styles.icon}
        />
        <View hspacer={true} />
        <H3 color={"bluegrey"}>{I18n.t("wallet.capability.title")}</H3>
      </View>
      {capabilityItems}
    </View>
  ) : null;
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  bpdRemoteConfig: bpdRemoteConfigSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodInitiatives);
