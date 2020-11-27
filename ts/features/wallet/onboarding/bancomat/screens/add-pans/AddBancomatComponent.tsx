import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { Card } from "../../../../../../../definitions/pagopa/walletv2/Card";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import customVariables from "../../../../../../theme/variables";
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

const AddBancomatComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [abiLogo, setAbiLogo] = React.useState<string | undefined>();

  React.useEffect(() => {
    const abi = props.abiList.find(elem => elem.abi === props.pan.abi);
    setAbiLogo(fromNullable(abi).fold(undefined, a => a.logoUrl));
  }, [props.currentIndex]);

  return (
    <BaseScreenComponent
      customGoBack={<View hspacer={true} spacer={true} />}
      headerTitle={I18n.t("wallet.onboarding.bancomat.add.title", {
        current: props.currentIndex + 1,
        length: props.pansNumber
      })}
      // TODO Replace with right CH texts
      contextualHelpMarkdown={{
        title: "wallet.walletCardTransaction.contextualHelpTitle",
        body: "wallet.walletCardTransaction.contextualHelpContent"
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View spacer={true} />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingHorizontal: customVariables.contentPadding
          }}
        >
          <H1>{I18n.t("wallet.onboarding.bancomat.add.screenTitle")}</H1>
          <View spacer={true} large={true} />
          <PreviewBancomatCard bancomat={props.pan} logoUrl={abiLogo} />
          <View spacer={true} large={true} />
          <Body>
            {props.pansNumber > 1
              ? I18n.t("wallet.onboarding.bancomat.add.bodyPlural", {
                  number: props.pansNumber
                })
              : I18n.t("wallet.onboarding.bancomat.add.bodySingular")}
          </Body>
          <View spacer={true} large={true} />
          <InfoBox>
            <Body>{I18n.t("wallet.onboarding.bancomat.add.warning")}</Body>
          </InfoBox>
        </View>

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
