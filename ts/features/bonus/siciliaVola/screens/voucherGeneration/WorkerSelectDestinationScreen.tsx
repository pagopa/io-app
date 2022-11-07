import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useRef } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import SV_ROUTES from "../../navigation/routes";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherFailure,
  svGenerateVoucherSelectCompany
} from "../../store/actions/voucherGeneration";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import { Company } from "../../types/SvVoucherRequest";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const WorkerSelectDestinationScreen = (
  props: Props
): React.ReactElement | null => {
  const elementRef = useRef(null);
  const navigation = useNavigation();

  const backButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.back,
    title: "Back"
  };
  const continueButtonProps = {
    primary: false,
    bordered: true,
    onPress: () =>
      navigation.navigate(SV_ROUTES.VOUCHER_GENERATION.SELECT_FLIGHTS_DATA),
    title: "Continue"
  };

  if (
    O.isSome(props.selectedBeneficiaryCategory) &&
    props.selectedBeneficiaryCategory.value !== "worker"
  ) {
    props.failure("The selected category is not Worker");
    return null;
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"WorkerSelectDestinationScreen"}
        ref={elementRef}
      >
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>
            {I18n.t(
              "bonus.sv.voucherGeneration.worker.selectDestination.title"
            )}
          </H1>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={backButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel()),
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason)),
  selectCompany: (company: Company) =>
    dispatch(svGenerateVoucherSelectCompany(company))
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkerSelectDestinationScreen);
