import { View } from "native-base";
import * as React from "react";
import { fromNullable } from "fp-ts/lib/Option";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import I18n from "../../../../../../i18n";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import customVariables from "../../../../../../theme/variables";
import { H1 } from "../../../../../../components/core/typography/H1";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { H4 } from "../../../../../../components/core/typography/H4";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { GlobalState } from "../../../../../../store/reducers/types";
import { abiListSelector } from "../../../store/abi";
import PanCardComponent from "./PanCardComponent";

type Props = {
  pan: PatchedCard;
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
      headerTitle={I18n.t("wallet.addBancomat.title", {
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
          <H1>{I18n.t("wallet.addBancomat.screenTitle")}</H1>
          <View spacer={true} large={true} />
          <PanCardComponent
            pan={props.pan}
            abiLogo={abiLogo}
            user={
              props.profile
                ? `${props.profile.name} ${props.profile.family_name}`
                : ""
            }
          />
          <View spacer={true} large={true} />
          <H4 color={"bluegrey"} weight={"Regular"}>
            {props.pansNumber > 1
              ? I18n.t("wallet.addBancomat.bodyPlural", {
                  number: props.pansNumber
                })
              : I18n.t("wallet.addBancomat.bodySingular")}
          </H4>
        </View>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(
            props.handleSkip,
            I18n.t("wallet.addBancomat.skip")
          )}
          rightButton={confirmButtonProps(
            props.handleContinue,
            I18n.t("global.buttons.continue")
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
