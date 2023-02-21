import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useNavigation } from "@react-navigation/native";
import { BpdConfig } from "../../../../../definitions/content/BpdConfig";
import Initiative from "../../../../../img/wallet/initiatives.svg";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { bpdEnabled } from "../../../../config";
import I18n from "../../../../i18n";
import {
  bpdRemoteConfigSelector,
  isIdPayEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import BpdPaymentMethodCapability from "../../../bonus/bpd/components/BpdPaymentMethodCapability";
import {
  EnableableFunctions,
  EnableableFunctionsEnum
} from "../../../../../definitions/pagopa/EnableableFunctions";
import { HSpacer } from "../../../../components/core/spacer/Spacer";
import { idPayWalletInitiativeListSelector } from "../../../idpay/wallet/store/reducers";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { Body } from "../../../../components/core/typography/Body";
import { IDPayInitiativeListItem } from "../../../idpay/wallet/components/IDPayInitiativesListItem";

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
  capability: EnableableFunctions,
  index: number,
  bpdRemoteConfig?: BpdConfig
) => {
  switch (capability) {
    case EnableableFunctionsEnum.FA:
    case EnableableFunctionsEnum.pagoPA:
      return null;
    case EnableableFunctionsEnum.BPD:
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
  paymentMethod.enableableFunctions.reduce(
    (acc, val, i): ReadonlyArray<React.ReactNode> => {
      const handlerForCapability = capabilityFactory(
        paymentMethod,
        val,
        i,
        bpdRemoteConfig
      );
      return handlerForCapability === null
        ? acc
        : [...acc, handlerForCapability];
    },
    [] as ReadonlyArray<React.ReactNode>
  );

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
  const { isIdPayEnabled, initiativeListPot } = props;
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const namedInitiativesList = pot
    .getOrElse(initiativeListPot, [])
    .filter(initiative => initiative.initiativeName !== undefined);

  const shouldRenderIdPay = isIdPayEnabled && namedInitiativesList.length > 0;
  const mappedIdPayInitiatives = namedInitiativesList.map(item => (
    <IDPayInitiativeListItem key={item.initiativeId} item={item} />
  ));
  const itemsArray = [
    ...(shouldRenderIdPay ? mappedIdPayInitiatives : []),
    ...capabilityItems
  ];

  const navigateToPairableInitiativesList = () =>
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      initiatives: itemsArray,
      idWallet: props.paymentMethod.idWallet
    });
  return itemsArray.length > 0 ? (
    <View style={props.style}>
      <View style={styles.row}>
        <View style={styles.row}>
          <Initiative
            width={20}
            height={20}
            stroke={IOColors.bluegreyDark}
            style={styles.icon}
          />
          <HSpacer size={16} />
          <H3 color={"bluegrey"}>{I18n.t("wallet.capability.title")}</H3>
        </View>
        <Body
          weight="SemiBold"
          color="blue"
          onPress={navigateToPairableInitiativesList}
        >
          {I18n.t("idpay.wallet.preview.showAll")}
        </Body>
      </View>
      {itemsArray.slice(0, 3)}
    </View>
  ) : null;
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  bpdRemoteConfig: bpdRemoteConfigSelector(state),
  isIdPayEnabled: isIdPayEnabledSelector(state),
  initiativeListPot: idPayWalletInitiativeListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodInitiatives);
