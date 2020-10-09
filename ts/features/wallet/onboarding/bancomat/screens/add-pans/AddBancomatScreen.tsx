import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { View } from "native-base";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { abis, pans } from "../../mock/mockData";
import { H1 } from "../../../../../../components/core/typography/H1";
import customVariables from "../../../../../../theme/variables";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { navigateBack } from "../../../../../../store/actions/navigation";
import I18n from "../../../../../../i18n";
import { Card } from "../../../../../../../definitions/pagopa/bancomat/Card";
import { profileSelector } from "../../../../../../store/reducers/profile";
import { H4 } from "../../../../../../components/core/typography/H4";
import { abiListSelector } from "../../store/reducers/abi";
import PanCardComponent from "./PanCardComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * This screen is displayed when Bancomat are found and ready to be added in wallet
 * @constructor
 */
export const AddBancomatScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [abiLogo, setAbiLogo] = React.useState<string | undefined>();

  const handleOnContinue = () => {
    if (currentIndex === props.pans.length - 1) {
      props.onContinue();
    } else {
      setCurrentIndex(currentIndex + 1);
      props.onContinue();
    }
  };

  const handleSkip = () => {
    if (currentIndex === props.pans.length - 1) {
      props.onCancel();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  React.useEffect(() => {
    const abi = props.abiList.find(
      elem => elem.abi === props.pans[currentIndex].abi
    );
    setAbiLogo(fromNullable(abi).fold(undefined, a => a.logoUrl));
  }, [currentIndex]);

  return (
    <BaseScreenComponent
      customGoBack={<View hspacer={true} spacer={true} />}
      headerTitle={I18n.t("wallet.addBancomat.title", {
        current: currentIndex + 1,
        length: props.pans.length
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
            pan={props.pans[currentIndex] as Card}
            abiLogo={abiLogo}
            user={
              props.profile
                ? `${props.profile.name} ${props.profile.family_name}`
                : ""
            }
          />
          <View spacer={true} large={true} />
          <H4 color={"bluegrey"} weight={"Regular"}>
            {props.pans.length > 1
              ? I18n.t("wallet.addBancomat.bodyPlural", {
                  number: props.pans.length
                })
              : I18n.t("wallet.addBancomat.bodySingular")}
          </H4>
        </View>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(
            props.onCancel,
            I18n.t("wallet.addBancomat.skip")
          )}
          rightButton={confirmButtonProps(
            handleOnContinue,
            I18n.t("global.buttons.continue")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(navigateBack()),
  onContinue: () => null
});

const mapStateToProps = (state: GlobalState) => ({
  // abiList: abiListSelector(state),
  abiList: abis,
  pans,
  profile: pot.toUndefined(profileSelector(state))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddBancomatScreen);
