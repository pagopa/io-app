import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { BpdConfig } from "../../../../../definitions/content/BpdConfig";
import {
  EnableableFunctions,
  EnableableFunctionsEnum
} from "../../../../../definitions/pagopa/EnableableFunctions";
import Initiative from "../../../../../img/wallet/initiatives.svg";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { HSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { bpdEnabled } from "../../../../config";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { bpdRemoteConfigSelector } from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import BpdPaymentMethodCapability from "../../../bonus/bpd/components/BpdPaymentMethodCapability";
import { IDPayInitiativeListItem } from "../../../idpay/wallet/components/IDPayInitiativesListItem";
import { idPayWalletInitiativesGet } from "../../../idpay/wallet/store/actions";
import {
  idpayInitiativesListSelector,
  isIdpayWalletInitiativesWithInstrumentErrorSelector
} from "../../../idpay/wallet/store/reducers";

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
  const { namedInitiativesList, loadIdpayInitiatives } = props;
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const idWalletString = String(props.paymentMethod.idWallet);
  const areInitiativesInError = useIOSelector(
    isIdpayWalletInitiativesWithInstrumentErrorSelector
  );

  React.useEffect(() => {
    const timer = setInterval(
      () => loadIdpayInitiatives(idWalletString, true),
      areInitiativesInError ? 6000 : 3000
    );
    return () => clearInterval(timer);
  }, [areInitiativesInError, idWalletString, loadIdpayInitiatives]);
  const mappedIdPayInitiatives = namedInitiativesList.map(item => (
    <IDPayInitiativeListItem
      key={item.initiativeId}
      item={item}
      idWallet={idWalletString}
    />
  ));
  const itemsArray = [...mappedIdPayInitiatives, ...capabilityItems];

  const navigateToPairableInitiativesList = () =>
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      capabilityItems
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadIdpayInitiatives: (idWallet: string, isRefreshCall?: boolean) =>
    dispatch(idPayWalletInitiativesGet.request({ idWallet, isRefreshCall }))
});
const mapStateToProps = (state: GlobalState) => ({
  bpdRemoteConfig: bpdRemoteConfigSelector(state),
  namedInitiativesList: idpayInitiativesListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodInitiatives);
