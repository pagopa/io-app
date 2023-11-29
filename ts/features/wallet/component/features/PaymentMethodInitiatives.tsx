import { Body, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { NewH6 } from "../../../../components/core/typography/NewH6";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentMethod } from "../../../../types/pagopa";
import { IdPayInstrumentInitiativesList } from "../../../idpay/wallet/components/IdPayInstrumentInitiativesList";
import {
  idPayInitiativesFromInstrumentGet,
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop
} from "../../../idpay/wallet/store/actions";
import { idPayEnabledInitiativesFromInstrumentSelector } from "../../../idpay/wallet/store/reducers";

type Props = {
  paymentMethod: PaymentMethod;
} & Pick<React.ComponentProps<typeof View>, "style">;

/**
 * This component enlists the different initiatives active on the payment methods
 * @param props
 * @constructor
 */
const PaymentMethodInitiatives = (props: Props): React.ReactElement | null => {
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const idWalletString = String(props.paymentMethod.idWallet);

  const dispatch = useIODispatch();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        idPayInitiativesFromInstrumentGet.request({
          idWallet: idWalletString
        })
      );
      dispatch(
        idPayInitiativesFromInstrumentRefreshStart({
          idWallet: idWalletString
        })
      );
      return () => {
        dispatch(idPayInitiativesFromInstrumentRefreshStop());
      };
    }, [idWalletString, dispatch])
  );

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
        <NewH6 color={"grey-700"}>{I18n.t("wallet.capability.title")}</NewH6>
        <Body
          weight="SemiBold"
          color="blue"
          onPress={navigateToPairableInitiativesList}
        >
          {I18n.t("idpay.wallet.preview.showAll")}
        </Body>
      </View>
      <VSpacer size={16} />
      <IdPayInstrumentInitiativesList
        idWallet={idWalletString}
        initiatives={initiativesList.slice(0, 3)}
      />
    </View>
  ) : null;
};

export default PaymentMethodInitiatives;
