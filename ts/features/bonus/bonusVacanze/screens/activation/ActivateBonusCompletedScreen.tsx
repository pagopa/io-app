import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { confirmButtonProps } from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { completeBonusVacanzeActivation } from "../../store/actions/bonusVacanze";
import { bonusVacanzeLogo } from "../../store/reducers/availableBonusesTypes";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen informs the user that the bonus has been activated!
 * It allows only one CTA: goto -> display bonus details
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const ActivateBonusCompletedScreen: React.FunctionComponent<Props> = props => {
  const title = I18n.t("bonus.bonusVacanze.activation.completed.title");
  const body = I18n.t("bonus.bonusVacanze.activation.completed.description");
  const goToBonusDetail = I18n.t("bonus.bonusVacanze.activation.goToDetails");

  return (
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={
          props.logo ? renderInfoRasterImage({ uri: props.logo }) : undefined
        }
        title={title}
        body={body}
      />
      <FooterStackButton
        buttons={[confirmButtonProps(props.onConfirm, goToBonusDetail)]}
      />
    </SafeAreaView>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  logo: bonusVacanzeLogo(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onConfirm: () => dispatch(completeBonusVacanzeActivation())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBonusCompletedScreen);
