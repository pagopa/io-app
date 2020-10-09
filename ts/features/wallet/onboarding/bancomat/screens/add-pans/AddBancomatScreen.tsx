import * as React from "react";
import { View } from "native-base";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { GlobalState } from "../../../../../../store/reducers/types";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { pans } from "../../mock/mockData";
import { H1 } from "../../../../../../components/core/typography/H1";
import customVariables from "../../../../../../theme/variables";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { navigateBack } from "../../../../../../store/actions/navigation";
import I18n from "../../../../../../i18n";
import PanCardComponent from "./PanCardComponent";
import { Card } from "../../../../../../../definitions/pagopa/bancomat/Card";

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

  const handleOnContinue = () => {
    setCurrentIndex(currentIndex + 1);
    props.onContinue();
  };

  return (
    <BaseScreenComponent headerTitle={"Aggiungi bancomat"}>
      <SafeAreaView style={{ flex: 1 }}>
        <View spacer={true} />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingHorizontal: customVariables.contentPadding
          }}
        >
          <H1>{"Vuoi aggiungere questa carta?"}</H1>
          <View spacer={true} large={true} />
          <PanCardComponent
            pan={props.pans[0] as Card}
            abiLogo={
              "https://upload.wikimedia.org/wikipedia/it/thumb/5/51/Intesa_Sanpaolo_logo.svg/320px-Intesa_Sanpaolo_logo.svg.png"
            }
          />
        </View>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(
            props.onCancel,
            I18n.t("global.buttons.cancel")
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

const mapStateToProps = (_: GlobalState) => ({
  pans
});

export default connect(mapStateToProps, mapDispatchToProps)(AddBancomatScreen);
