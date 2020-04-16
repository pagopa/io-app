import I18n from "i18n-js";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber
} from "italia-pagopa-commons/lib/pagopa";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { NavigationInjectedProps } from "react-navigation";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import H5 from "../../../components/ui/H5";
import IconFont from "../../../components/ui/IconFont";
import ROUTES from "../../../navigation/routes";
import customVariables from "../../../theme/variables";

export type mockedItem = {
  service_id: string;
  service_icon: string;
  service_name: string;
  organization_name: string;
  department_name: string;
  amounts: ReadonlyArray<AmountInEuroCents>;
  video_source: string;
  cover: string;
  description: string;
};

const getAmountFromNumber = (n: number) =>
  AmountInEuroCentsFromNumber.decode(n / 100.0).value as AmountInEuroCents;

const mockedList: ReadonlyArray<mockedItem> = [
  {
    service_id: "01",
    service_icon:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Regione-Lombardia-Stemma.svg/1200px-Regione-Lombardia-Stemma.svg.png",
    service_name: "Emergenza COVID19 Terapia Intensiva",
    department_name: "Regione Lombardia",
    organization_name: "PagoPA spa",
    amounts: [
      getAmountFromNumber(500),
      getAmountFromNumber(1000),
      getAmountFromNumber(5000)
    ],
    video_source: "https://www.youtube.com/watch?v=RHOAu5GwKnE",
    cover: "https://i.ytimg.com/vi/RHOAu5GwKnE/maxresdefault.jpg",
    description: "asdasdasds sdfasjdk fgaef "
  },
  {
    service_id: "02",
    service_icon:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Regione-Lombardia-Stemma.svg/1200px-Regione-Lombardia-Stemma.svg.png",
    service_name: "Ventilatori polmonari per la lotta al coronavirus",
    organization_name: "PagoPA spa",
    department_name: "Regione Lombardia",
    amounts: [
      getAmountFromNumber(5000),
      getAmountFromNumber(2000),
      getAmountFromNumber(10000)
    ],
    video_source: "https://www.youtube.com/watch?v=RHOAu5GwKnE",
    cover: "https://i.ytimg.com/vi/RHOAu5GwKnE/maxresdefault.jpg",
    description: "asdasdasds sdfasjdk fgaef "
  }
];

const styles = StyleSheet.create({
  item: {
    width: "100%",
    height: 180,
    borderRadius: 8
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 8
  },
  content: {
    position: "absolute",
    bottom: 16,
    right: 16,
    left: 16
  },
  textWithIcon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  h5: {
    flex: 1,
    color: customVariables.colorWhite
  },
  absolute: {
    position: "absolute"
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center"
  }
});

const getLinearGradient = () => {
  const ROUNDED_RADIUS = "8";
  const WHOLE = "100%";
  const ZERO = "0%";

  return (
    <Svg width={WHOLE} height={WHOLE} style={styles.absolute}>
      <Defs>
        <LinearGradient id={"grad"} x1={ZERO} y1={ZERO} x2={ZERO} y2={WHOLE}>
          <Stop
            offset={ZERO}
            stopColor={customVariables.colorBlack}
            stopOpacity={"0"}
          />
          <Stop
            offset={WHOLE}
            stopColor={customVariables.colorBlack}
            stopOpacity={"0.8"}
          />
        </LinearGradient>
      </Defs>
      <Rect
        width={WHOLE}
        height={WHOLE}
        fill={"url(#grad)"}
        rx={ROUNDED_RADIUS} // radius
        ry={ROUNDED_RADIUS} // radius
      />
    </Svg>
  );
};

type Props = NavigationInjectedProps;

class DonationsHomeScreen extends React.PureComponent<Props> {
  private navigateToDetail = (item: mockedItem) =>
    this.props.navigation.navigate({
      routeName: ROUTES.DONATION_DETAIL,
      params: { item }
    });

  private renderItem = ({ item }: { item: mockedItem }) => {
    return (
      <TouchableDefaultOpacity
        style={styles.item}
        onPress={() => this.navigateToDetail(item)}
      >
        <Image source={{ uri: item.cover }} style={styles.image} />
        {getLinearGradient()}
        <View style={styles.content}>
          <Text numberOfLines={2} white={true}>
            {item.organization_name}
          </Text>
          <View style={styles.textWithIcon}>
            <H5 style={styles.h5} numberOfLines={2}>
              {item.service_name}
            </H5>
            <IconFont name={"io-right"} color={customVariables.colorWhite} />
          </View>
        </View>
      </TouchableDefaultOpacity>
    );
  };

  public render() {
    return (
      <BaseScreenComponent
        headerTitle={I18n.t("donations.home.header")}
        goBack={true}
      >
        <Content noPadded={true}>
          <ScreenContentHeader
            title={I18n.t("donations.home.title")}
            iconFont={{ name: "io-heart" }}
          />
          <View spacer={true} />
          <View style={styles.padded}>
            <Text>{I18n.t("donations.home.subtitle")}</Text>
            <Text
              link={true}
              onPress={() => {
                /** TODO */
              }}
            >
              {I18n.t("wallet.moreInfo")}
            </Text>
            <View spacer={true} small={true} />

            <View style={styles.row}>
              <Text style={{ flex: 1 }}>
                {I18n.t("donations.home.collaboration")}
              </Text>
              <Image
                source={require("../../../../img/wallet/Intesa_Sanpaolo_logo.png")}
                style={{ width: 160, height: "100%", resizeMode: "contain" }}
              />
            </View>
            <View spacer={true} />
            <FlatList
              data={mockedList}
              renderItem={this.renderItem}
              keyExtractor={item => `donation-${item.service_id}`}
              ItemSeparatorComponent={() => <View spacer={true} />}
            />
            <View spacer={true} />
          </View>
        </Content>
      </BaseScreenComponent>
    );
  }
}

export default DonationsHomeScreen;
