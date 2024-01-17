import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useRoute, Route } from "@react-navigation/native";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { navigateBack } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";
import BonusInformationComponent from "../../common/components/BonusInformationComponent";
import { ownedActiveOrRedeemedBonus } from "../store/reducers/allActive";

export type BonusInformationScreenNavigationParams = Readonly<{
  bonusItem: BonusAvailable;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "bonus.bonusInformation.contextualHelp.title",
  body: "bonus.bonusInformation.contextualHelp.body"
};

/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationScreen: React.FunctionComponent<Props> = props => {
  const route =
    useRoute<
      Route<"BONUS_REQUEST_INFORMATION", BonusInformationScreenNavigationParams>
    >();
  const getBonusItem = () => route.params.bonusItem;
  const bonusType = getBonusItem();

  return (
    <BonusInformationComponent
      primaryCtaText={I18n.t("bonus.bonusVacanze.cta.requestBonus")}
      bonus={bonusType}
      onCancel={props.navigateBack}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["bonus_information"]}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  hasOwnedActiveBonus: ownedActiveOrRedeemedBonus(state).length > 0
});

const mapDispatchToProps = (_: Dispatch) => ({
  navigateBack: () => navigateBack()
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BonusInformationScreen);
