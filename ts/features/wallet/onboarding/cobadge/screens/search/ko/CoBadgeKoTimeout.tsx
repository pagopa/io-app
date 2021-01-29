import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import {
  searchUserCoBadge,
  walletAddCoBadgeCancel
} from "../../../store/actions";
import { onboardingCoBadgeAbiSelectedSelector } from "../../../store/reducers/abiSelected";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  // TODO: replace locales
  headerTitle: "TMP header title",
  title: "TMP title",
  body: "TMP body",
  cancel: I18n.t("global.buttons.cancel"),
  retry: I18n.t("global.buttons.retry")
});

/**
 * This screen informs the user that the search operation could not be completed
 * @constructor
 */
const CoBadgeKoTimeout = (props: Props): React.ReactElement => {
  const { headerTitle, title, body, cancel, retry } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterTwoButtons
          type={"TwoButtonsInlineThird"}
          onRight={() => props.retry(props.abiSelected)}
          onCancel={props.cancel}
          rightText={retry}
          leftText={cancel}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel()),
  retry: (abiSelected: string | undefined) =>
    dispatch(searchUserCoBadge.request(abiSelected))
});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingCoBadgeAbiSelectedSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeKoTimeout);
