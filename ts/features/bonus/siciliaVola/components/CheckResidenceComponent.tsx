import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import SV_ROUTES from "../navigation/routes";
import { svGenerateVoucherCancel } from "../store/actions/voucherGeneration";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
const getCheckResidencyRegionItems = (): ReadonlyArray<RadioItem<boolean>> => [
  {
    body: I18n.t("bonus.sv.voucherGeneration.checkResidence.items.inSicily"),
    id: true
  },
  {
    body: I18n.t("bonus.sv.voucherGeneration.checkResidence.items.notInSicily"),
    id: false
  }
];

const CheckResidenceComponent = (props: Props): React.ReactElement => {
  const [isResidentInSicily, setIsResidentInSicily] = React.useState<
    boolean | undefined
  >();

  const navigation = useNavigation();

  const cancelButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.cancel,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    bordered: false,
    onPress: () =>
      isResidentInSicily === true
        ? navigation.navigate(
            SV_ROUTES.VOUCHER_GENERATION.SELECT_BENEFICIARY_CATEGORY
          )
        : navigation.navigate(SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_RESIDENCE),
    title: I18n.t("global.buttons.continue"),
    disabled: isResidentInSicily === undefined
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"CheckResidenceComponent"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("bonus.sv.voucherGeneration.checkResidence.title")}</H1>
          <VSpacer size={16} />

          <RadioButtonList<boolean>
            key="check_income"
            items={getCheckResidencyRegionItems()}
            selectedItem={isResidentInSicily}
            onPress={setIsResidentInSicily}
          />
          <VSpacer size={16} />
          <Body>
            {I18n.t("bonus.sv.voucherGeneration.checkResidence.info")}
          </Body>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(svGenerateVoucherCancel())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckResidenceComponent);
