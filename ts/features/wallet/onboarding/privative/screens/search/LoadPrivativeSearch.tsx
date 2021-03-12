import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { isNone } from "fp-ts/lib/Option";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  searchUserPrivative,
  walletAddPrivativeCancel
} from "../../store/actions";
import {
  onboardingSearchedPrivativeSelector,
  SearchedPrivativeData
} from "../../store/reducers/searchedPrivative";
import { onboardingPrivativeFoundIsError } from "../../store/reducers/foundPrivative";
import { useHardwareBackButton } from "../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { WithTestID } from "../../../../../../types/WithTestID";
import { showToast } from "../../../../../../utils/showToast";
import { mixpanelTrack } from "../../../../../../mixpanel";
import { toPrivativeQuery } from "./SearchPrivativeCardScreen";

type Props = WithTestID<
  ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>
>;

/**
 * Loading screen while search the privative card
 * @param props
 * @constructor
 */
const LoadPrivativeSearch = (props: Props): React.ReactElement | null => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
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
      <LoadingErrorComponent
        {...props}
        loadingCaption={I18n.t("wallet.onboarding.privative.search.loading")}
        onAbort={props.cancel}
        onRetry={() => props.retry(privativeQueryParam.value)}
      />
    );
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  retry: (searchedPrivativeData: Required<SearchedPrivativeData>) =>
    dispatch(searchUserPrivative.request(searchedPrivativeData))
});

const mapStateToProps = (state: GlobalState) => ({
  privativeSelected: onboardingSearchedPrivativeSelector(state),
  isLoading: !onboardingPrivativeFoundIsError(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadPrivativeSearch);
