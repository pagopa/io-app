import * as React from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import { FooterTwoButtons } from "../../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import {
  PrivativeQuery,
  searchUserPrivative,
  walletAddPrivativeCancel,
  walletAddPrivativeFailure
} from "../../../store/actions";
import { onboardingSearchedPrivativeQuerySelector } from "../../../store/reducers/searchedPrivative";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  title: I18n.t("wallet.onboarding.privative.search.koTimeout.title"),
  body: I18n.t("wallet.onboarding.privative.search.koTimeout.body"),
  cancel: I18n.t("global.buttons.cancel"),
  retry: I18n.t("global.buttons.retry")
});

/**
 * This screen informs the user that a timeout is occurred while searching the indicated privative card.
 * The timeout can be:
 * - A networking timeout
 * - An application center which send a pending response
 * @param props
 * @constructor
 */
const PrivativeKoTimeout = (props: Props): React.ReactElement | null => {
  const { headerTitle, title, body, cancel, retry } = loadLocales();

  useHardwareBackButton(() => {
    props.cancel();
    return true;
  });

  const { privativeSelected } = props;

  if (privativeSelected === undefined) {
    props.failure("privativeSelected is undefined in PrivativeKoTimeout");
    return null;
  } else {
    return (
      <BaseScreenComponent
        goBack={false}
        customGoBack={<View />}
        headerTitle={headerTitle}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex} testID={"PrivativeKoTimeout"}>
          <InfoScreenComponent
            image={renderInfoRasterImage(image)}
            title={title}
            body={body}
          />
          <FooterTwoButtons
            type={"TwoButtonsInlineThird"}
            onRight={() => props.retry(privativeSelected)}
            onCancel={props.cancel}
            rightText={retry}
            leftText={cancel}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    );
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  failure: (reason: string) => dispatch(walletAddPrivativeFailure(reason)),
  retry: (searchedPrivativeData: PrivativeQuery) =>
    dispatch(searchUserPrivative.request(searchedPrivativeData))
});

const mapStateToProps = (state: GlobalState) => ({
  privativeSelected: onboardingSearchedPrivativeQuerySelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(PrivativeKoTimeout);
