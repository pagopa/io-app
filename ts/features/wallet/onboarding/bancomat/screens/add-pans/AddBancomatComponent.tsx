import * as React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
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
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import { isBancomatBlocked } from "../../../../../../utils/paymentMethod";
import {
  HSpacer,
  VSpacer
} from "../../../../../../components/core/spacer/Spacer";

type Props = {
  pan: Card;
  pansNumber: number;
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

const AddBancomatComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [abiInfo, setAbiInfo] = React.useState<Abi>({});
  const { pan, abiList } = props;

  React.useEffect(() => {
    const abi: Abi | undefined = abiList.find(elem => elem.abi === pan.abi);
    setAbiInfo(abi ?? {});
  }, [pan, abiList]);

  return (
    <BaseScreenComponent
      customGoBack={<HSpacer size={16} />}
      headerTitle={I18n.t("wallet.onboarding.bancomat.add.title")}
      // TODO Replace with right CH texts
      contextualHelpMarkdown={{
        title: "wallet.walletCardTransaction.contextualHelpTitle",
        body: "wallet.walletCardTransaction.contextualHelpContent"
      }}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.flex}>
          <VSpacer size={16} />
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
            <VSpacer size={8} />
            <H4 weight={"Regular"} style={styles.flexStart}>
              {I18n.t("wallet.onboarding.bancomat.add.label", {
                current: props.currentIndex + 1,
                length: props.pansNumber
              })}
            </H4>
            <VSpacer size={24} />
            <PreviewBancomatCard bancomat={props.pan} abi={abiInfo} />
            <VSpacer size={24} />
            {isBancomatBlocked(props.pan) ? (
              <InfoBox iconColor="red" iconName="errorFilled">
                <Body>{I18n.t("wallet.onboarding.bancomat.add.blocked")}</Body>
              </InfoBox>
            ) : (
              <InfoBox>
                <Body>{I18n.t("wallet.onboarding.bancomat.add.warning")}</Body>
              </InfoBox>
            )}
          </View>
          <VSpacer size={16} />
        </ScrollView>
        {isBancomatBlocked(props.pan) ? (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={confirmButtonProps(
              props.handleSkip,
              I18n.t("global.buttons.continue")
            )}
          />
        ) : (
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
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  abiList: abiListSelector(state)
});

export default connect(mapStateToProps)(AddBancomatComponent);
