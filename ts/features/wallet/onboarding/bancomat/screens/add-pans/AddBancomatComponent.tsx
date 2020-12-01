import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { Card } from "../../../../../../../definitions/pagopa/walletv2/Card";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../components/core/typography/Body";
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
import PreviewBancomatCard from "../../../../bancomat/component/bancomatCard/PreviewBancomatCard";
import { abiListSelector } from "../../../store/abi";

type Props = {
  pan: Card;
  pansNumber: number;
  currentIndex: number;
  handleContinue: () => void;
  handleSkip: () => void;
  profile?: InitializedProfile;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  title: { lineHeight: 33, alignSelf: "flex-start" },
  flexStart: { alignSelf: "flex-start" }
});
const AddBancomatComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [abiLogo, setAbiLogo] = React.useState<string | undefined>();

  React.useEffect(() => {
    const abi = props.abiList.find(elem => elem.abi === props.pan.abi);
    setAbiLogo(fromNullable(abi).fold(undefined, a => a.logoUrl));
  }, [props.currentIndex]);

  return (
    <BaseScreenComponent
      customGoBack={<View hspacer={true} spacer={true} />}
      headerTitle={I18n.t("wallet.onboarding.bancomat.add.title")}
      // TODO Replace with right CH texts
      contextualHelpMarkdown={{
        title: "wallet.walletCardTransaction.contextualHelpTitle",
        body: "wallet.walletCardTransaction.contextualHelpContent"
      }}
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
              {I18n.t("wallet.onboarding.bancomat.add.screenTitle")}
            </H1>
            <View spacer small />
            <H4 weight={"Regular"} style={styles.flexStart}>
              {I18n.t("wallet.onboarding.bancomat.add.label", {
                current: props.currentIndex + 1,
                length: props.pansNumber
              })}
            </H4>
            <View spacer={true} large={true} />
            <PreviewBancomatCard bancomat={props.pan} logoUrl={abiLogo} />
            <View spacer={true} large={true} />
            <InfoBox>
              <Body>{I18n.t("wallet.onboarding.bancomat.add.warning")}</Body>
            </InfoBox>
          </View>
          <View spacer />
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

export default connect(mapStateToProps)(AddBancomatComponent);
