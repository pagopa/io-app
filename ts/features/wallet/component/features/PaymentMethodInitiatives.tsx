import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Initiative from "../../../../../img/wallet/initiatives.svg";
import { HSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import {
  idpayInitiativesListSelector,
  idPayAreInitiativesFromInstrumentErrorSelector
} from "../../../idpay/wallet/store/reducers";
import { idPayInitiativesFromInstrumentGet } from "../../../idpay/wallet/store/actions";
import { IDPayInitiativesList } from "../../../idpay/wallet/components/IDPayInitiativesListComponents";

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

/**
 * This component enlists the different initiatives active on the payment methods
 * @param props
 * @constructor
 */
const PaymentMethodInitiatives = (props: Props): React.ReactElement | null => {
  const { namedInitiativesList, loadIdpayInitiatives } = props;
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const idWalletString = String(props.paymentMethod.idWallet);
  const areInitiativesInError = useIOSelector(
    idPayAreInitiativesFromInstrumentErrorSelector
  );

  React.useEffect(() => {
    const timer = setInterval(
      () => loadIdpayInitiatives(idWalletString, true),
      areInitiativesInError ? 6000 : 3000
    );
    return () => clearInterval(timer);
  }, [areInitiativesInError, idWalletString, loadIdpayInitiatives]);

  const navigateToPairableInitiativesList = () =>
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      idWallet: idWalletString
    });
  return namedInitiativesList.length > 0 ? (
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
      <IDPayInitiativesList
        idWallet={idWalletString}
        initiatives={namedInitiativesList.slice(0, 3)}
      />
    </View>
  ) : null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadIdpayInitiatives: (idWallet: string, isRefreshCall?: boolean) =>
    dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet,
        isRefreshCall
      })
    )
});
const mapStateToProps = (state: GlobalState) => ({
  namedInitiativesList: idpayInitiativesListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodInitiatives);
