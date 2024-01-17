import { Route, useRoute } from "@react-navigation/native";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { navigateBack } from "../../../../store/actions/navigation";
import BonusInformationComponent from "../../common/components/BonusInformationComponent";

export type BonusInformationScreenNavigationParams = Readonly<{
  bonusItem: BonusAvailable;
}>;

type Props = ReturnType<typeof mapDispatchToProps>;

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

const mapDispatchToProps = (_: Dispatch) => ({
  navigateBack: () => navigateBack()
});

export default connect(mapDispatchToProps)(BonusInformationScreen);
