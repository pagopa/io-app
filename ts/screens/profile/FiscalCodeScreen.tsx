import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import FiscalCodeLandscapeOverlay from "../../components/FiscalCodeLandscapeOverlay";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import DarkLayout from "../../components/screens/DarkLayout";
import TouchableWithoutOpacity from "../../components/TouchableWithoutOpacity";
import H5 from "../../components/ui/H5";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import { contentMunicipalityLoad } from "../../store/actions/content";
import { municipalitySelector } from "../../store/reducers/content";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

const styles = StyleSheet.create({
  darkBg: {
    backgroundColor: customVariables.brandDarkGray
  },
  white: {
    color: customVariables.colorWhite
  },
  shadow: {
    // iOS
    paddingBottom: 20,
    shadowColor: customVariables.brandDarkestGray,
    shadowOffset: {
      width: 1,
      height: 8
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    // Android
    elevation: 8
  },
  spacer: {
    width: 8
  },
  largeSpacer: {
    width: customVariables.contentPadding
  },
  text: {
    paddingHorizontal: customVariables.contentPadding,
    marginTop: -10
  }
});

class FiscalCodeScreen extends React.PureComponent<Props> {
  private showModal(showBackSide: boolean = false) {
    if (this.props.profile) {
      this.props.showModal(
        <FiscalCodeLandscapeOverlay
          onCancel={this.props.hideModal}
          profile={this.props.profile}
          municipality={this.props.municipality}
          showBackSide={showBackSide}
        />
      );
    }
  }

  public componentDidMount() {
    if (
      this.props.profile !== undefined &&
      pot.isNone(this.props.municipality.data)
    ) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        this.props.profile.fiscal_code.substring(11, 15)
      );
      maybeCodiceCatastale.map(c => this.props.loadMunicipality(c));
    }
  }

  public render() {
    return (
      <React.Fragment>
        <DarkLayout
          allowGoBack={true}
          headerBody={
            <Text white={true}>{I18n.t("profile.fiscalCode.title")}</Text>
          }
          contentStyle={styles.darkBg}
          contextualHelp={{
            title: I18n.t("profile.fiscalCode.title"),
            body: () => <Markdown>{I18n.t("profile.fiscalCode.help")}</Markdown>
          }}
          hideHeader={true}
          topContent={
            <React.Fragment>
              <View spacer={true} />
              <H5 style={styles.white}>
                {I18n.t("profile.fiscalCode.fiscalCode")}
              </H5>
              <View spacer={true} />
            </React.Fragment>
          }
        >
          {this.props.profile && (
            <React.Fragment>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.largeSpacer} />
                <TouchableWithoutOpacity onPress={() => this.showModal()}>
                  <View style={styles.shadow}>
                    <FiscalCodeComponent
                      type={"Full"}
                      profile={this.props.profile}
                      getBackSide={false}
                      municipality={this.props.municipality}
                    />
                  </View>
                </TouchableWithoutOpacity>
                <View style={styles.spacer} />
                <TouchableWithoutOpacity onPress={() => this.showModal()}>
                  <View style={styles.shadow}>
                    <FiscalCodeComponent
                      type={"Full"}
                      profile={this.props.profile}
                      getBackSide={true}
                      municipality={this.props.municipality}
                    />
                  </View>
                </TouchableWithoutOpacity>

                <View style={styles.largeSpacer} />
              </ScrollView>
              <Text white={true} style={styles.text}>
                {I18n.t("profile.fiscalCode.content")}
              </Text>
            </React.Fragment>
          )}
        </DarkLayout>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  profile: pot.toUndefined(profileSelector(state)),
  municipality: municipalitySelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadMunicipality: (code: CodiceCatastale) =>
    dispatch(contentMunicipalityLoad.request(code))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(FiscalCodeScreen));
