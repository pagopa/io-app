import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { LoadingErrorComponent } from "../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

type Props = {
  onCancel: () => void;
  onAccept: () => void;
};

// TODO change with the ufficial TOS page see https://pagopa.atlassian.net/browse/IASV-10
const tosUrl = "https://io.italia.it/app-content/tos_privacy.html";

/**
 * This component loads and shows the tos url
 * The user can accept or cancel (if the content is successfully loaded)
 * If the tos content can't be load, an error will be shown and the user can retry to reload
 * @param props
 * @constructor
 */
const AcceptTosComponent = (props: Props): React.ReactElement => {
  const [tosLoadingState, setTosLoadingState] = React.useState<
    "loading" | "error" | "loaded"
  >("loading");
  const [_, setUrl] = React.useState(tosUrl);
  const undoButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.onCancel,
    title: I18n.t("global.buttons.cancel")
  };
  const requestBonusButtonProps = {
    primary: true,
    bordered: false,
    onPress: props.onAccept,
    title: I18n.t("bonus.sv.voucherGeneration.acceptTos.buttons.requestBonus")
  };

  const renderContent = () => {
    switch (tosLoadingState) {
      case "loaded":
      case "loading":
        // TODO Replace with a proper component (see https://pagopa.atlassian.net/browse/IASV-10)
        return <></>;
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
      goBack={props.onCancel}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"AcceptTosComponent"}>
        {renderContent()}
        {tosLoadingState === "loaded" && (
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={undoButtonProps}
            rightButton={requestBonusButtonProps}
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  ));
  return <ContainerComponent isLoading={tosLoadingState === "loading"} />;
};

export default AcceptTosComponent;
