import {
  FooterWithButtons,
  H2,
  H6,
  HSpacer,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import BPayCard from "../../../../bancomatpay/component/BPayCard";
import { abiListSelector } from "../../../store/abi";

type Props = {
  account: BPay;
  accountsNumber: number;
  currentIndex: number;
  handleContinue: () => void;
  handleSkip: () => void;
  profile?: InitializedProfile;
} & ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  title: { lineHeight: 33, alignSelf: "flex-start" },
  flexStart: { alignSelf: "flex-start" }
});

const AddBPayComponent: React.FunctionComponent<Props> = (props: Props) => (
  <BaseScreenComponent
    customGoBack={<HSpacer size={16} />}
    headerTitle={I18n.t("wallet.onboarding.bPay.headerTitle")}
    contextualHelp={props.contextualHelp}
  >
    <ScrollView style={IOStyles.flex}>
      <SafeAreaView style={IOStyles.flex}>
        <VSpacer size={16} />
        <View
          style={[
            styles.container,
            IOStyles.flex,
            IOStyles.horizontalContentPadding
          ]}
        >
          <H2 style={styles.title}>
            {I18n.t("wallet.onboarding.bPay.add.screenTitle")}
          </H2>
          <VSpacer size={8} />
          <H6 style={styles.flexStart}>
            {I18n.t("wallet.onboarding.bPay.add.label", {
              current: props.currentIndex + 1,
              length: props.accountsNumber
            })}
          </H6>
          <VSpacer size={24} />
          <BPayCard phone={props.account.numberObfuscated} />
        </View>
        <VSpacer size={16} />
      </SafeAreaView>
    </ScrollView>
    <FooterWithButtons
      type="TwoButtonsInlineThird"
      primary={{
        type: "Outline",
        buttonProps: {
          label: I18n.t("global.buttons.skip"),
          accessibilityLabel: I18n.t("global.buttons.skip"),
          onPress: props.handleSkip
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          label: I18n.t("global.buttons.add"),
          accessibilityLabel: I18n.t("global.buttons.add"),
          onPress: props.handleContinue
        }
      }}
    />
  </BaseScreenComponent>
);

const mapStateToProps = (state: GlobalState) => ({
  abiList: abiListSelector(state)
});

export default connect(mapStateToProps)(AddBPayComponent);
