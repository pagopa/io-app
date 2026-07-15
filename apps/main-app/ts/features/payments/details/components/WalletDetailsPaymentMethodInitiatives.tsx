import { Body, H6, VSpacer } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps, ReactElement, useCallback } from "react";
import { View } from "react-native";

import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayInstrumentInitiativesList } from "../../../idpay/wallet/components/IdPayInstrumentInitiativesList";
import {
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop
} from "../../../idpay/wallet/store/actions";
import { idPayEnabledInitiativesFromInstrumentSelector } from "../../../idpay/wallet/store/reducers";
import { PaymentsMethodDetailsRoutes } from "../navigation/routes";

type Props = Pick<ComponentProps<typeof View>, "style"> & {
  paymentMethod: WalletInfo;
};

/**
 * This component enlists the different initiatives active on the payment
 * methods
 *
 * @class
 * @param props
 */
const WalletDetailsPaymentMethodInitiatives = (
  props: Props
): null | ReactElement => {
  const navigation = useIONavigation();
  const idWalletString = props.paymentMethod.walletId;

  const dispatch = useIODispatch();

  const startInitiativeRefreshPolling = useCallback(() => {
    dispatch(
      idPayInitiativesFromInstrumentRefreshStart({
        idWallet: idWalletString
      })
    );
    return () => {
      dispatch(idPayInitiativesFromInstrumentRefreshStop());
    };
  }, [idWalletString, dispatch]);

  useFocusEffect(startInitiativeRefreshPolling);

  const initiativesList = useIOSelector(
    idPayEnabledInitiativesFromInstrumentSelector
  );

  const navigateToPairableInitiativesList = () =>
    navigation.navigate({
      name: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR,
      params: {
        screen: PaymentsMethodDetailsRoutes.IDPAY_INITIATIVE_DETAILS_LIST,
        params: {
          idWallet: idWalletString
        }
      }
    });

  return initiativesList.length > 0 ? (
    <View style={props.style} testID="idPayInitiativesList">
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <H6 color={"grey-700"}>{I18n.t("wallet.capability.title")}</H6>
        <Body
          asLink
          onPress={navigateToPairableInitiativesList}
          weight="Semibold"
        >
          {I18n.t("idpay.wallet.card.showAll")}
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

export default WalletDetailsPaymentMethodInitiatives;
