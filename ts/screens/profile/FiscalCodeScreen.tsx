import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import FiscalCodeLandscapeOverlay from "../../components/FiscalCodeLandscapeOverlay";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import H5 from "../../components/ui/H5";
import {
  BottomTopAnimation,
  LightModalContextInterface
} from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { contentMunicipalityLoad } from "../../store/actions/content";
import { municipalitySelector } from "../../store/reducers/content";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";

type Props = ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps &
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

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.fiscalCode.title",
  body: "profile.fiscalCode.help"
};

class FiscalCodeScreen extends React.PureComponent<Props> {
  private showModal(showBackSide: boolean = false) {
    if (this.props.profile) {
      const component = (
        <FiscalCodeLandscapeOverlay
          onCancel={this.props.hideModal}
          profile={this.props.profile}
          municipality={this.props.municipality.data}
          showBackSide={showBackSide}
        />
      );
      this.props.showAnimatedModal(component, BottomTopAnimation);
    }
  }

  public componentDidMount() {
    if (this.props.profile !== undefined) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        this.props.profile.fiscal_code.substring(11, 15)
      );
      // if municipality data are none we request a load
      if (pot.isNone(this.props.municipality.data)) {
        maybeCodiceCatastale.map(c => this.props.loadMunicipality(c));
      }
    }
  }

  public render() {
    return (
      <React.Fragment>
        <DarkLayout
          allowGoBack={true}
          headerBody={
            <TouchableDefaultOpacity
              onPress={() => this.props.navigation.goBack()}
            >
              <Text white={true}>{I18n.t("profile.fiscalCode.title")}</Text>
            </TouchableDefaultOpacity>
          }
          contentStyle={styles.darkBg}
          contextualHelpMarkdown={contextualHelpMarkdown}
          faqCategories={["profile"]}
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
                <TouchableDefaultOpacity onPress={() => this.showModal()}>
                  <View style={styles.shadow}>
                    <FiscalCodeComponent
                      type={"Full"}
                      profile={this.props.profile}
                      getBackSide={false}
                      municipality={this.props.municipality.data}
                    />
                  </View>
                </TouchableDefaultOpacity>
                <View style={styles.spacer} />
                <TouchableDefaultOpacity onPress={() => this.showModal(true)}>
                  <View style={styles.shadow}>
                    <FiscalCodeComponent
                      type={"Full"}
                      profile={this.props.profile}
                      getBackSide={true}
                      municipality={this.props.municipality.data}
                    />
                  </View>
                </TouchableDefaultOpacity>

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
