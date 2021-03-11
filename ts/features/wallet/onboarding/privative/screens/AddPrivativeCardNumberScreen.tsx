import { Input, Item, View } from "native-base";
import * as React from "react";
import { useState } from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { navigateToOnboardingPrivativeSearchAvailable } from "../navigation/action";
import {
  walletAddPrivativeCancel,
  walletAddPrivativeInsertCardNumber
} from "../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * In this screen the user can:
 * - insert the privative card number and start the search
 * - read the terms and condition
 * @constructor
 * @param _
 */
const AddPrivativeCardNumberScreen = (props: Props): React.ReactElement => {
  const [cardNumber, setCardNumber] = useState("");

  return (
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
          <H1>TMP Inserisci numero carta</H1>
          <View spacer={true} />
          <Item>
            <Input
              onChangeText={text => {
                // On Android we cannot modify the input text, or the text is duplicated
                setCardNumber(text);
              }}
            />
          </Item>
        </View>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(props.cancel)}
          rightButton={confirmButtonProps(
            () => props.search(cardNumber),
            I18n.t("global.buttons.continue")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  search: (cardNumber: string) => {
    dispatch(walletAddPrivativeInsertCardNumber(cardNumber));
    dispatch(navigateToOnboardingPrivativeSearchAvailable());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPrivativeCardNumberScreen);
