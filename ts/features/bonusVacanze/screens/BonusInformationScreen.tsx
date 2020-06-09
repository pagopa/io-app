import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import { MultiImage } from "../../../components/ui/MultiImage";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { loadServiceDetail } from "../../../store/actions/services";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../../store/reducers/types";
import customVariables from "../../../theme/variables";
import { logosForService } from "../../../utils/services";
import TosBonusComponent from "../components/TosBonusComponent";
import { navigateToBonusEligibilityLoading } from "../navigation/action";
import { BonusAvailable } from "../types/bonusesAvailable";

type NavigationParams = Readonly<{
  bonusItem: BonusAvailable;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  noPadded: {
    paddingLeft: 0,
    paddingRight: 0
  },
  mainContent: {
    flex: 1
  },
  flexEnd: {
    alignSelf: "flex-end"
  },
  flexStart: {
    alignSelf: "flex-start"
  },
  cover: {
    resizeMode: "contain",
    width: 48,
    height: 48
  },
  serviceMultiImage: {
    width: 48,
    height: 48
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  orgName: {
    fontSize: 18,
    lineHeight: customVariables.lineHeight2
  },
  title: {
    fontSize: customVariables.fontSize3,
    lineHeight: customVariables.lineHeightH3,
    color: customVariables.colorBlack
  }
});

/**
 * A screen to explain how the bonus activation works and how it will be assigned
 */
const BonusInformationScreen: React.FunctionComponent<Props> = props => {
  const [isMarkdownLoaded, setMarkdownLoaded] = React.useState(false);
  const [loadedService, setLoadedService] = React.useState(false);

  const getBonusItem = () => props.navigation.getParam("bonusItem");

  const bonusItem = getBonusItem();

  const cancelButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: props.navigateBack,
    title: I18n.t("global.buttons.cancel")
  };
  const requestButtonProps = {
    block: true,
    primary: true,
    onPress: props.requestBonusActivation,
    title: `${I18n.t("bonus.bonusVacanza.request")} ${bonusItem.name}`
  };

  const handleModalPress = () =>
    props.showModal(<TosBonusComponent onClose={props.hideModal} />);

  React.useEffect(() => {
    if (
      pot.isNone(props.serviceById) &&
      bonusItem.service_id &&
      !loadedService
    ) {
      props.loadService(bonusItem.service_id);
      setLoadedService(true);
    }
  });

  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent goBack={true} headerTitle={bonusItem.name}>
      <Content>
        <View style={styles.row}>
          <View style={styles.flexStart}>
            {pot.isSome(props.serviceById) && (
              <MultiImage
                style={styles.serviceMultiImage}
                source={logosForService(props.serviceById.value)}
              />
            )}
          </View>
          <View style={styles.flexEnd}>
            {bonusItem.cover && (
              <Image source={{ uri: bonusItem.cover }} style={styles.cover} />
            )}
          </View>
        </View>
        <View spacer={true} />
        {pot.isSome(props.serviceById) && (
          <Text dark={true} style={styles.orgName}>
            {props.serviceById.value.organization_name}
          </Text>
        )}
        <Text bold={true} dark={true} style={styles.title}>{`${I18n.t(
          "bonus.requestTitle"
        )} ${bonusItem.name}`}</Text>
        <View spacer={true} large={true} />
        <Text dark={true}>{bonusItem.description}</Text>
        <ButtonDefaultOpacity
          style={styles.noPadded}
          small={true}
          transparent={true}
          onPress={handleModalPress}
        >
          <Text>{I18n.t("bonus.tos.title")}</Text>
        </ButtonDefaultOpacity>
        <View spacer={true} />
        <ItemSeparatorComponent noPadded={true} />
        <View spacer={true} />
        <Markdown onLoadEnd={() => setMarkdownLoaded(true)}>
          {/* TODO Replace with correct text of bonus */
          I18n.t("profile.main.privacy.exportData.info.body")}
        </Markdown>
        <View spacer={true} extralarge={true} />
        <ItemSeparatorComponent noPadded={true} />
        <View spacer={true} extralarge={true} />
        <Text dark={true}>{I18n.t("bonus.bonusVacanza.advice")}</Text>
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />
        <View spacer={true} large={true} />
      </Content>
      {isMarkdownLoaded && (
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          leftButton={cancelButtonProps}
          rightButton={requestButtonProps}
        />
      )}
    </BaseScreenComponent>
  ));
  return <ContainerComponent isLoading={!isMarkdownLoaded} />;
};

const mapStateToProps = (state: GlobalState, props: OwnProps) => {
  const serviceById = fromNullable(
    props.navigation.getParam("bonusItem").service_id
  ).fold(pot.none, s => serviceByIdSelector(s)(state) || pot.none);
  return {
    serviceById
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestBonusActivation: () => dispatch(navigateToBonusEligibilityLoading()),
  loadService: (id: string) => dispatch(loadServiceDetail.request(id)),
  navigateBack: () => dispatch(navigateBack())
});

export default withLightModalContext(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BonusInformationScreen)
);
