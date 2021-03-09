import * as React from "react";
import { View } from "native-base";
import WebView from "react-native-webview";
import { Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H5 } from "../../../../../components/core/typography/H5";
import { H3 } from "../../../../../components/core/typography/H3";
import I18n from "../../../../../i18n";
import { Card } from "../../../../../../definitions/cgn/Card";
import { GlobalState } from "../../../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { localeDateFormat } from "../../../../../utils/locale";
import cgnLogo from "../../../../../../img/bonus/cgn/cgn_logo.png";
import { playSvg } from "./CardSvgPayload";

type Props = {
  cgnDetails: Card;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "#000",
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    height: 192
  },
  cgnCard: {
    position: "absolute",
    width: "100%",
    height: 192,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7
    },
    zIndex: 7,
    elevation: 7
  },
  informationContainer: {
    height: "100%",
    top: -190,
    zIndex: 9,
    elevation: 9
  },
  spaced: {
    justifyContent: "space-between"
  },
  flex1: {
    flex: 1
  },
  flex2: {
    flex: 2
  },
  paddedContentFull: {
    paddingLeft: 16,
    paddingTop: 24,
    paddingRight: 20,
    paddingBottom: 16
  },
  column: {
    flexDirection: "column"
  },
  fullLogo: {
    resizeMode: "contain",
    height: 56,
    width: 56,
    alignSelf: "flex-end"
  }
});

const CgnCardComponent: React.FunctionComponent<Props> = (props: Props) => (
  <View style={[IOStyles.horizontalContentPadding, styles.cgnCard]}>
    <View style={[styles.cardContainer]}>
      <WebView
        style={{ borderRadius: 10, borderWidth: 1 }}
        source={{ html: playSvg }}
      />
    </View>
    <View style={[styles.informationContainer, styles.paddedContentFull]}>
      <View
        style={[
          IOStyles.row,
          IOStyles.flex,
          { justifyContent: "space-between" }
        ]}
      >
        <View style={[styles.column, styles.flex2, styles.spaced]}>
          <H3 weight={"Bold"} color={"black"}>
            {I18n.t("bonus.cgn.name")}
          </H3>
          <View>
            {props.cgnDetails.status !== "PENDING" && (
              <H5>
                {"Valida fino al " +
                  localeDateFormat(
                    props.cgnDetails.expiration_date,
                    I18n.t("global.dateFormats.shortFormat")
                  )}
              </H5>
            )}
            {props.currentProfile && (
              <H3 weight={"Bold"} color={"black"}>
                {props.currentProfile}
              </H3>
            )}
          </View>
        </View>
        <View style={[styles.column, styles.flex1, styles.spaced]}>
          <View hspacer />
          <Image source={cgnLogo} style={styles.fullLogo} />
        </View>
      </View>
    </View>
  </View>
);

const mapStateToProps = (state: GlobalState) => ({
  currentProfile: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps)(CgnCardComponent);
