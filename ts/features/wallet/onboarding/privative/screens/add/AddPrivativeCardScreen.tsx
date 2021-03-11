import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { getValueOrElse } from "../../../../../bonus/bpd/model/RemoteValue";
import {
  addPrivativeToWallet,
  walletAddPrivativeCancel
} from "../../store/actions";
import { onboardingPrivativeFoundSelector } from "../../store/reducers/foundPrivative";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen shows the user the private card found and allows him to add it to the wallet
 * @param props
 * @constructor
 */
const AddPrivativeCardScreen = (props: Props): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("wallet.onboarding.privative.headerTitle")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView
      style={IOStyles.flex}
      testID={"ChoosePrivativeIssuerComponent"}
    >
      {/* TODO: Complete the component, this is a draft version for test purpose only */}
      <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
        <H1>TMP Privative card display screen</H1>
        <Body>Card Number: {props.foundPrivative}</Body>
      </View>
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={cancelButtonProps(
          props.cancel,
          I18n.t("global.buttons.skip")
        )}
        rightButton={confirmButtonProps(
          () =>
            props.foundPrivative
              ? props.addToWallet(props.foundPrivative)
              : undefined,
          I18n.t("global.buttons.add")
        )}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  addToWallet: (pi: PaymentInstrument) =>
    dispatch(addPrivativeToWallet.request(pi))
});

const mapStateToProps = (state: GlobalState) => ({
  foundPrivative: fromNullable(
    getValueOrElse(onboardingPrivativeFoundSelector(state), undefined)
  ).mapNullable(response => response.paymentInstrument)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPrivativeCardScreen);
