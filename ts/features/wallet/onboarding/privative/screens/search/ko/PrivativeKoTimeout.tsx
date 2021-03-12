import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { isNone } from "fp-ts/lib/Option";
import I18n from "../../../../../../../i18n";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import { useHardwareBackButton } from "../../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import {
  searchUserPrivative,
  walletAddPrivativeCancel
} from "../../../store/actions";
import {
  onboardingSearchedPrivativeSelector,
  SearchedPrivativeData
} from "../../../store/reducers/searchedPrivative";
import { toPrivativeQuery } from "../SearchPrivativeCardScreen";
import { showToast } from "../../../../../../../utils/showToast";
import { mixpanelTrack } from "../../../../../../../mixpanel";

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

  const privativeQueryParam = toPrivativeQuery(props.privativeSelected);
  if (isNone(privativeQueryParam)) {
    showToast(I18n.t("global.genericError"), "danger");
    void mixpanelTrack("PRIVATIVE_NO_QUERY_PARAMS_ERROR");
    props.cancel();
    return null;
  } else {
    return (
      <BaseScreenComponent
        goBack={false}
        customGoBack={<View />}
        headerTitle={headerTitle}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex} testID={"CoBadgeKoTimeout"}>
          <InfoScreenComponent
            image={renderInfoRasterImage(image)}
            title={title}
            body={body}
          />
          <FooterTwoButtons
            type={"TwoButtonsInlineThird"}
            onRight={() => props.retry(privativeQueryParam.value)}
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
  retry: (searchedPrivativeData: Required<SearchedPrivativeData>) =>
    dispatch(searchUserPrivative.request(searchedPrivativeData))
});

const mapStateToProps = (state: GlobalState) => ({
  privativeSelected: onboardingSearchedPrivativeSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(PrivativeKoTimeout);
