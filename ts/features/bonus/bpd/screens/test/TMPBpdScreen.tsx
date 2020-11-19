import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { Label } from "../../../../../components/core/typography/Label";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { GlobalState } from "../../../../../store/reducers/types";
import { paymentMethodsSelector } from "../../../../../store/reducers/wallet/wallets";
import { PatchedWalletV2 } from "../../../../../types/pagopa";
import { cancelButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { PaymentMethodRawList } from "../../components/paymentMethodActivationToggle/list/PaymentMethodRawList";
import {
  fold,
  isReady,
  isUndefined,
  RemoteValue
} from "../../model/RemoteValue";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import { bpdDeleteUserFromProgram } from "../../store/actions/onboarding";
import { bpdEnabledSelector } from "../../store/reducers/details/activation";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const renderBpdActive = (value: RemoteValue<boolean, Error>) =>
  fold(
    value,
    () => <LabelSmall color={"bluegrey"}>Sconosciuta</LabelSmall>,
    () => <LabelSmall color={"bluegrey"}>In caricamento</LabelSmall>,
    active => (
      <LabelSmall color={active ? "blue" : "red"}>
        {active ? "Attiva" : "Non attiva"}
      </LabelSmall>
    ),
    _ => <LabelSmall color={"red"}>Errore durante il caricamento</LabelSmall>
  );

const renderPaymentMethod = (
  potWallets: pot.Pot<ReadonlyArray<PatchedWalletV2>, Error>
) =>
  pot.fold(
    potWallets,
    // TODO: handle error, loading with spinner if needed
    () => (
      <LabelSmall color={"bluegrey"}>
        Metodi di pagamento sconosciuti
      </LabelSmall>
    ),
    () => (
      <LabelSmall color={"bluegrey"}>
        Metodi di pagamento in caricamento
      </LabelSmall>
    ),
    _ => null,
    _ => (
      <LabelSmall color={"red"}>
        Errore nel recuperare i metodi di pagamento
      </LabelSmall>
    ),
    value => <PaymentMethodRawList paymentList={value} />,
    value => <PaymentMethodRawList paymentList={value} />,
    value => <PaymentMethodRawList paymentList={value} />,
    value => <PaymentMethodRawList paymentList={value} />
  );

/**
 * A temp screen created to allow the test of some bpd functionalities waiting for the detail screen.
 * TODO: remove after bpd detail screen
 * @constructor
 */
const TmpBpdScreen: React.FunctionComponent<Props> = props => {
  const bpdActive = renderBpdActive(props.bpdActive);

  useEffect(() => {
    if (isUndefined(props.bpdActive)) {
      props.loadBpdActivation();
    }
  }, []);

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Test Bpd"}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <ScrollView>
            <View spacer={true} large={true} />
            <H1>Test bpd screen</H1>
            <View spacer={true} large={true} />
            <Body>La tua iscrizione al cashback è: {bpdActive}</Body>
            <View spacer={true} large={true} />
            {isReady(props.bpdActive) && props.bpdActive.value ? (
              <>
                <Label color={"bluegrey"}>Metodi di pagamento:</Label>
                {renderPaymentMethod(props.potWallets)}
              </>
            ) : (
              <Body>
                Iscriviti al cashback per visualizzare la lista dei metodi di
                pagamento
              </Body>
            )}
          </ScrollView>
        </View>
        {isReady(props.bpdActive) && props.bpdActive.value && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={cancelButtonProps(
              props.cancelBpd,
              "Cancella la tua iscrizione al cashback"
            )}
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadBpdActivation: () => dispatch(bpdLoadActivationStatus.request()),
  cancelBpd: () => dispatch(bpdDeleteUserFromProgram.request())
});

const mapStateToProps = (state: GlobalState) => ({
  bpdActive: bpdEnabledSelector(state),
  potWallets: paymentMethodsSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(TmpBpdScreen);
