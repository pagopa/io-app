import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  AvailableDestinationRequest,
  svGenerateVoucherAvailableDestination,
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherFailure
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { navigateToSvVoucherGeneratedScreen } from "../../navigation/actions";
import I18n from "../../../../../i18n";
import { voucherRequestSelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import { useEffect } from "react";
import {
  destinationsInfoFromVoucherRequest,
  isVoucherRequest
} from "../../utils";
import { availableDestinationsSelector } from "../../store/reducers/voucherGeneration/availableDestinations";
import { isLoading, isReady } from "../../../bpd/model/RemoteValue";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { View } from "native-base";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";
import { openWebUrl } from "../../../../../utils/url";
import { Link } from "../../../../../components/core/typography/Link";
import themeVariables from "../../../../../theme/variables";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const mapCategory: Record<SvBeneficiaryCategory, string> = {
  disabled: I18n.t(
    "bonus.sv.voucherGeneration.summary.fields.category.value.disabled"
  ),
  student: I18n.t(
    "bonus.sv.voucherGeneration.summary.fields.category.value.student"
  ),
  sick: I18n.t("bonus.sv.voucherGeneration.summary.fields.category.value.sick"),
  worker: I18n.t(
    "bonus.sv.voucherGeneration.summary.fields.category.value.worker"
  )
};

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderWidth: 2,
    borderColor: themeVariables.brandPrimary
  }
});

// TODO: update with the correct disclaimer: https://pagopa.atlassian.net/browse/IASV-40
const disclaimerLink =
  "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:2000-12-28;445";

const SummaryScreen = (props: Props): React.ReactElement | null => {
  const {
    maybeVoucherRequest,
    requestAvailableDestinations,
    availableDestinations
  } = props;
  useEffect(() => {
    if (
      maybeVoucherRequest.isSome() &&
      isVoucherRequest(maybeVoucherRequest.value) &&
      maybeVoucherRequest.value.category !== "disabled"
    ) {
      requestAvailableDestinations(
        destinationsInfoFromVoucherRequest(maybeVoucherRequest.value)
      );
    }
  }, [maybeVoucherRequest, requestAvailableDestinations]);

  if (!maybeVoucherRequest.isSome()) {
    props.failure();
    return null;
  }
  const voucherRequest = maybeVoucherRequest.value;

  if (!isVoucherRequest(voucherRequest)) {
    props.failure();
    return null;
  }

  if (
    !isReady(availableDestinations) &&
    voucherRequest.category !== "disabled"
  ) {
    return (
      <BaseScreenComponent
        goBack={true}
        contextualHelp={emptyContextualHelp}
        headerTitle={I18n.t("bonus.sv.headerTitle")}
      >
        <LoadingErrorComponent
          isLoading={isLoading(props.availableDestinations)}
          loadingCaption={I18n.t("global.genericWaiting")}
          onRetry={() =>
            requestAvailableDestinations(
              destinationsInfoFromVoucherRequest(voucherRequest)
            )
          }
        />
      </BaseScreenComponent>
    );
  }

  const backButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.back,
    title: "Back"
  };
  const continueButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.navigateToVoucherGeneratedScreen,
    title: "Continue"
  };

  const destinations: ReadonlyArray<string> =
    voucherRequest.category === "disabled"
      ? ["Tutte"]
      : isReady(availableDestinations)
      ? availableDestinations.value
      : [];

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"SummaryScreen"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("bonus.sv.voucherGeneration.summary.title")}</H1>
          <View spacer />
          <H4 weight={"Regular"}>
            {I18n.t("bonus.sv.voucherGeneration.summary.subtitle1.normal1")}
            <Link onPress={() => openWebUrl(disclaimerLink)}>
              {I18n.t("bonus.sv.voucherGeneration.summary.subtitle1.link")}
            </Link>
            {I18n.t("bonus.sv.voucherGeneration.summary.subtitle1.normal2")}
          </H4>
          <View spacer />
          <View
            style={{
              borderLeftWidth: 2,
              borderLeftColor: IOColors.greyLight,
              paddingLeft: 10
            }}
          >
            <View>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <H4 weight={"Regular"}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.residence.label"
                  )}
                </H4>

                <H4 style={{ paddingRight: 10, paddingLeft: 10 }}>
                  {mapCategory[voucherRequest.category]}
                </H4>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row"
                }}
              >
                <H4 weight={"Regular"}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.category.label"
                  )}
                </H4>
                <View hspacer small />

                <H4>{mapCategory[voucherRequest.category]}</H4>
              </View>
            </View>
          </View>
          <View spacer />

          <H4 weight={"Regular"}>
            {I18n.t("bonus.sv.voucherGeneration.summary.subtitle2")}
          </H4>

          <View spacer />
          <View
            style={{
              borderLeftWidth: 2,
              borderLeftColor: IOColors.greyLight,
              flex: 1,
              flexDirection: "row"
            }}
          >
            <View hspacer />
            <View>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <H4 weight={"Regular"}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.flightDate"
                  )}
                </H4>
                <View hspacer small />
                <H4>
                  {formatDateAsLocal(voucherRequest.departureDate, true, true)}
                </H4>
              </View>
              <View>
                <H4 weight={"Regular"}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.availableDestination"
                  )}
                </H4>
                {destinations.map(d => (
                  <H4>{mapCategory[voucherRequest.category]}</H4>
                ))}
              </View>
            </View>
          </View>
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
  failure: () => dispatch(svGenerateVoucherFailure("Request not complete")),
  requestAvailableDestinations: (
    availableDestinationRequest: AvailableDestinationRequest
  ) =>
    dispatch(
      svGenerateVoucherAvailableDestination.request(availableDestinationRequest)
    ),
  navigateToVoucherGeneratedScreen: () =>
    dispatch(navigateToSvVoucherGeneratedScreen())
});
const mapStateToProps = (state: GlobalState) => ({
  maybeVoucherRequest: voucherRequestSelector(state),
  availableDestinations: availableDestinationsSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(SummaryScreen);
