import * as React from "react";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../components/core/typography/Body";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentMethod } from "../../../../types/pagopa";
import { IDPayInitiativesList } from "../../../idpay/wallet/components/IDPayInitiativesListComponents";
import {
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop
} from "../../../idpay/wallet/store/actions";
import { idPayEnabledInitiativesFromInstrumentSelector } from "../../../idpay/wallet/store/reducers";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import SectionHeader from "../../../../components/services/SectionHeader";

type OwnProps = {
  paymentMethod: PaymentMethod;
} & Pick<React.ComponentProps<typeof View>, "style">;

type Props = ReturnType<typeof mapDispatchToProps> & OwnProps;

/**
 * This component enlists the different initiatives active on the payment methods
 * @param props
 * @constructor
 */
const PaymentMethodInitiatives = (props: Props): React.ReactElement | null => {
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const idWalletString = String(props.paymentMethod.idWallet);

  const dispatch = useIODispatch();

  const refresh = React.useCallback(() => {
    dispatch(
      idPayInitiativesFromInstrumentRefreshStart({
        idWallet: idWalletString
      })
    );
    return () => {
      dispatch(idPayInitiativesFromInstrumentRefreshStop());
    };
  }, [idWalletString, dispatch]);
  useFocusEffect(refresh);

  const initiativesList = useIOSelector(
    idPayEnabledInitiativesFromInstrumentSelector
  );

  const navigateToPairableInitiativesList = () =>
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      idWallet: idWalletString
    });

  return initiativesList.length > 0 ? (
    <View testID="idPayInitiativesList" style={props.style}>
      <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
        <SectionHeader iconName="initiatives" title="wallet.capability.title" />
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
        initiatives={initiativesList.slice(0, 3)}
      />
    </View>
  ) : null;
};

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(mapDispatchToProps)(PaymentMethodInitiatives);
