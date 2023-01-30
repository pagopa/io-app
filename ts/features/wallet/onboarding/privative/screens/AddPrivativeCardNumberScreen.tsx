import * as React from "react";
import { useContext, useState } from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { Link } from "../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { LabelledItem } from "../../../../../components/LabelledItem";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { LightModalContext } from "../../../../../components/ui/LightModal";
import { privacyUrl } from "../../../../../config";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps,
  disablePrimaryButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import TosBonusComponent from "../../../../bonus/common/components/TosBonusComponent";
import { navigateToOnboardingPrivativeSearchAvailable } from "../navigation/action";
import {
  walletAddPrivativeCancel,
  walletAddPrivativeInsertCardNumber
} from "../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const maxPanCodeLength = 19;
const minPanCodeLength = 1;

const loadLocales = () => ({
  title: I18n.t("wallet.onboarding.privative.addPrivativeCardNumber.title"),
  body: I18n.t("wallet.onboarding.privative.addPrivativeCardNumber.body"),
  disclaimer1: I18n.t(
    "wallet.onboarding.privative.addPrivativeCardNumber.disclaimer.text1"
  ),
  disclaimer2: I18n.t(
    "wallet.onboarding.privative.addPrivativeCardNumber.disclaimer.text2"
  )
});

/**
 * LabelledItem customized for the privative pan insertion
 * @param props
 * @constructor
 */
const PanInputField = (props: {
  value: string | undefined;
  onChangeText: (text: string) => void;
}): React.ReactElement => (
  <LabelledItem
    label={I18n.t("wallet.dummyCard.labels.pan")}
    inputMaskProps={{
      value: props.value,
      type: "custom",
      options: { mask: "9999999999999999999" },
      maxLength: maxPanCodeLength,
      onChangeText: props.onChangeText,
      keyboardType: "number-pad"
    }}
    testID={"PanInputField"}
  />
);

/**
 * Return the right {@link BlockButtonProps} configuration, based on the canContinue condition
 * @param canContinue
 * @param onPress
 */
const continueButtonProps = (
  canContinue: boolean,
  onPress: () => void
): BlockButtonProps =>
  canContinue
    ? confirmButtonProps(onPress, I18n.t("global.buttons.continue"))
    : disablePrimaryButtonProps(I18n.t("global.buttons.continue"));
/**
 * In this screen the user can:
 * - insert the privative card number and start the search
 * - read the terms and condition
 * @constructor
 * @param props
 */
const AddPrivativeCardNumberScreen = (props: Props): React.ReactElement => {
  const { title, body, disclaimer1, disclaimer2 } = loadLocales();
  const [cardNumber, setCardNumber] = useState("");

  const { showModal, hideModal } = useContext(LightModalContext);

  const openTosModal = () => {
    Keyboard.dismiss();
    showModal(<TosBonusComponent tos_url={privacyUrl} onClose={hideModal} />);
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.onboarding.privative.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <KeyboardAvoidingView
        style={IOStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView
          style={IOStyles.flex}
          testID={"AddPrivativeCardNumberScreen"}
        >
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <H1>{title}</H1>
            <VSpacer size={16} />
            <Body>{body}</Body>
            <VSpacer size={16} />

            <PanInputField
              value={cardNumber}
              onChangeText={text => {
                setCardNumber(text);
              }}
            />

            <VSpacer size={16} />
            <Body onPress={openTosModal}>
              {disclaimer1}
              <Link>{disclaimer2}</Link>
            </Body>
          </View>
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={cancelButtonProps(props.cancel)}
            rightButton={continueButtonProps(
              cardNumber.length >= minPanCodeLength,
              () => props.search(cardNumber)
            )}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  search: (cardNumber: string) => {
    Keyboard.dismiss();
    dispatch(walletAddPrivativeInsertCardNumber(cardNumber));
    navigateToOnboardingPrivativeSearchAvailable();
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPrivativeCardNumberScreen);
