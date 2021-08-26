import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { ReactElement, useEffect } from "react";
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
import IconFont from "../../components/ui/IconFont";
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


const FiscalCodeScreen: React.FunctionComponent<Props> = (props: Props) => {

  const handleBackPress = () => {
    props.navigation.goBack();
    return true;
  };

  // Decode codice catastale effect manager
  useEffect(() => {
    if (props.profile !== undefined) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        props.profile.fiscal_code.substring(11, 15)
      );
      maybeCodiceCatastale.map(code => props.loadMunicipality(code));
    }
  }, [props.profile]);

  const showModal = (showBackSide: boolean = false) => {
    if (props.profile) {
      const component = (
        <FiscalCodeLandscapeOverlay
          onCancel={props.hideModal}
          profile={props.profile}
          municipality={props.municipality.data}
          showBackSide={showBackSide}
        />
      );
      props.showAnimatedModal(component, BottomTopAnimation);
    }
  };

  const customGoBack: ReactElement = (
    <TouchableDefaultOpacity
      onPress={handleBackPress}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont
        name={"io-back"}
        style={{ color: customVariables.colorWhite }}
      />
    </TouchableDefaultOpacity>
  );

  return (
    <React.Fragment>
      <DarkLayout
        allowGoBack={true}
        customGoBack={customGoBack}
        headerBody={
          <TouchableDefaultOpacity onPress={() => props.navigation.goBack}>
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
        {props.profile && (
          <React.Fragment>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.largeSpacer} />
              <TouchableDefaultOpacity
                onPress={() => showModal()}
                accessibilityRole={"button"}
              >
                <View style={styles.shadow}>
                  <FiscalCodeComponent
                    type={"Full"}
                    profile={props.profile}
                    getBackSide={false}
                    municipality={props.municipality.data}
                  />
                </View>
              </TouchableDefaultOpacity>
              <View style={styles.spacer} />
              <TouchableDefaultOpacity
                onPress={() => showModal(true)}
                accessibilityRole={"button"}
              >
                <View style={styles.shadow}>
                  <FiscalCodeComponent
                    type={"Full"}
                    profile={props.profile}
                    getBackSide={true}
                    municipality={props.municipality.data}
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
};

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
