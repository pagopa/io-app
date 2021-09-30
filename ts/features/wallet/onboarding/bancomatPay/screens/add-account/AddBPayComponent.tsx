import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { H1 } from "../../../../../../components/core/typography/H1";
import { H4 } from "../../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { abiListSelector } from "../../../store/abi";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import BPayCard from "../../../../bancomatpay/component/BPayCard";

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

const AddBPayComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [abiInfo, setAbiInfo] = React.useState<Abi>({});
  const { account, abiList } = props;

  React.useEffect(() => {
    const abi: Abi | undefined = abiList.find(
      elem => elem.abi === account.instituteCode
    );
    setAbiInfo(abi ?? {});
  }, [account, abiList]);

  return (
    <BaseScreenComponent
      customGoBack={<View hspacer={true} spacer={true} />}
      headerTitle={I18n.t("wallet.onboarding.bPay.headerTitle")}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.flex}>
          <View spacer={true} />
          <View
            style={[
              styles.container,
              IOStyles.flex,
              IOStyles.horizontalContentPadding
            ]}
          >
            <H1 style={styles.title}>
              {I18n.t("wallet.onboarding.bPay.add.screenTitle")}
            </H1>
            <View spacer small />
            <H4 weight={"Regular"} style={styles.flexStart}>
              {I18n.t("wallet.onboarding.bPay.add.label", {
                current: props.currentIndex + 1,
                length: props.accountsNumber
              })}
            </H4>
            <View spacer={true} large={true} />
            <BPayCard
              phone={props.account.numberObfuscated}
              abiLogo={abiInfo.logoUrl}
              bankName={props.account.bankName ?? ""} // This should never be undefined
            />
          </View>
          <View spacer={true} />
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(
            props.handleSkip,
            I18n.t("global.buttons.skip")
          )}
          rightButton={confirmButtonProps(
            props.handleContinue,
            I18n.t("global.buttons.add")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  abiList: abiListSelector(state)
});

export default connect(mapStateToProps)(AddBPayComponent);
