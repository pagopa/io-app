import * as React from "react";
import { SafeAreaView } from "react-native";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import TosWebviewComponent from "../../../../components/TosWebviewComponent";
import { LoadingErrorComponent } from "../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";

// TODO change with the ufficial TOS page see https://pagopa.atlassian.net/browse/AP-19
const tosUrl = "https://io.italia.it/app-content/tos_privacy.html";

const CdcBonusRequestInformationTos = () => {
  const [tosLoadingState, setTosLoadingState] = React.useState<
    "loading" | "error" | "loaded"
  >("loading");
  const [url, setUrl] = React.useState(tosUrl);

  const cancelButtonProps = {
    block: true,
    bordered: true,
    // TODO: integrate with the navigation implemented in the PR: https://github.com/pagopa/io-app/pull/3911
    onPress: () => true,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    block: true,
    primary: true,
    // TODO: integrate with the navigation implemented in the PR: https://github.com/pagopa/io-app/pull/3911
    onPress: () => true,
    title: I18n.t("global.buttons.continue")
  };

  const renderContent = () => {
    switch (tosLoadingState) {
      case "loaded":
      case "loading":
        return (
          <TosWebviewComponent
            handleError={() => setTosLoadingState("error")}
            handleLoadEnd={() => setTosLoadingState("loaded")}
            url={url}
            shouldFooterRender={false}
          />
        );
      case "error":
        return (
          <LoadingErrorComponent
            isLoading={false}
            loadingCaption={I18n.t("global.genericWaiting")}
            onRetry={() => {
              setTosLoadingState("loading");
              // force url reloading
              setUrl(`${tosUrl}?time=${new Date().getTime()}`);
            }}
          />
        );
    }
  };

  const ContainerComponent = withLoadingSpinner(() => (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.cdc.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        {renderContent()}
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  ));

  return <ContainerComponent isLoading={tosLoadingState === "loading"} />;
};

export default CdcBonusRequestInformationTos;
