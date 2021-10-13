import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useEffect } from "react";
import { View } from "native-base";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherAvailableDestination,
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherFailure
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { navigateToSvVoucherGeneratedScreen } from "../../navigation/actions";
import I18n from "../../../../../i18n";
import { voucherRequestSelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import {
  destinationsInfoFromVoucherRequest,
  isVoucherRequest
} from "../../utils";
import { availableDestinationsSelector } from "../../store/reducers/voucherGeneration/availableDestinations";
import { isLoading, isReady } from "../../../bpd/model/RemoteValue";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";
import { openWebUrl } from "../../../../../utils/url";
import { Link } from "../../../../../components/core/typography/Link";
import { AeroportiAmmessiInputBean } from "../../../../../../definitions/api_sicilia_vola/AeroportiAmmessiInputBean";

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
  borderedContainer: {
    borderLeftWidth: 2,
    borderLeftColor: IOColors.greyLight,
    paddingLeft: 10
  },
  row: {
    flex: 1,
    flexDirection: "row"
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

  const cancelButtonProps = {
    bordered: true,
    onPress: props.back,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    primary: true,
    onPress: props.navigateToVoucherGeneratedScreen,
    title: I18n.t("global.buttons.continue")
  };

  const destinations: ReadonlyArray<string> =
    voucherRequest.category === "disabled"
      ? [
          I18n.t(
            "bonus.sv.voucherGeneration.summary.fields.flightDate.disabled"
          )
        ]
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
          <View style={styles.borderedContainer}>
            <View>
              <View style={styles.row}>
                <H4 weight={"Regular"}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.residence.label"
                  )}
                </H4>
                <View hspacer small />
                <H4 style={{ flexShrink: 1 }}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.residence.value"
                  )}
                </H4>
              </View>
              <View style={styles.row}>
                <H4 weight={"Regular"}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.category.label"
                  )}
                </H4>
                <View hspacer small />
                <H4 style={{ flexShrink: 1 }}>
                  {mapCategory[voucherRequest.category]}
                </H4>
              </View>
            </View>
          </View>
          <View spacer />

          <H4 weight={"Regular"}>
            {I18n.t("bonus.sv.voucherGeneration.summary.subtitle2")}
          </H4>

          <View spacer />
          <View style={styles.borderedContainer}>
            <View>
              <View style={styles.row}>
                <H4 weight={"Regular"}>
                  {I18n.t(
                    "bonus.sv.voucherGeneration.summary.fields.flightDate.label"
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
                  <H4 key={d}>{d}</H4>
                ))}
              </View>
            </View>
          </View>
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
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel()),
  failure: () => dispatch(svGenerateVoucherFailure("Request not complete")),
  requestAvailableDestinations: (
    availableDestinationRequest: AeroportiAmmessiInputBean
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
