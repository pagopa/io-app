import { Content } from "native-base";
import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";

type Props = ReturnType<typeof mapDispatchToProps>;

const AcceptTosBonusScreen: React.FunctionComponent<Props> = (props: Props) => {
  const [isMarkdownLoaded, setIsMarkdownLoaded] = React.useState(false);
  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent goBack={true} headerTitle={"Test"}>
      <Content>
        <View>
          <Markdown onLoadEnd={() => setIsMarkdownLoaded(true)}>
            {/* TODO Replace with correct text of bonus */
            I18n.t("profile.main.privacy.exportData.info.body")}
          </Markdown>
          {isMarkdownLoaded && <EdgeBorderComponent />}
        </View>
      </Content>
      {isMarkdownLoaded && (
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          rightButton={{
            block: true,
            primary: true,
            onPress: props.acceptTos,
            title: I18n.t("bonus.bonusVacanza.cta.requestBonus")
          }}
          leftButton={{
            cancel: true,
            block: true,
            onPress: props.navigateBack,
            title: I18n.t("global.buttons.cancel")
          }}
        />
      )}
    </BaseScreenComponent>
  ));
  return <ContainerComponent isLoading={!isMarkdownLoaded} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acceptTos: () => null,
  navigateBack: () => dispatch(navigateBack())
});

export default connect(
  undefined,
  mapDispatchToProps
)(AcceptTosBonusScreen);
