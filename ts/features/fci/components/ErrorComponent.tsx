import * as React from "react";
import { SafeAreaView } from "react-native";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { WithTestID } from "../../../types/WithTestID";
import { FooterStackButton } from "../../bonus/bonusVacanze/components/buttons/FooterStackButtons";
import { InfoScreenComponent } from "./InfoScreenComponent";

type Props = WithTestID<{
  title: string;
  subTitle: string;
  image: number;
  email?: EmailString;
  retry?: boolean;
  assistance?: boolean;
  onPress: () => void;
}>;

const ErrorComponent = (props: Props) => {
  const retryButtonProps = {
    testID: "FciRetryButtonTestID",
    block: true,
    primary: true,
    onPress: props.onPress,
    title: I18n.t("features.fci.errors.buttons.retry")
  };

  const closeButtonProps = {
    testID: "FciCloseButtonTestID",
    bordered: true,
    block: true,
    onPress: props.onPress,
    title: I18n.t("features.fci.errors.buttons.close")
  };

  const assistanceButtonProps = {
    testID: "FciAssistanceButtonTestID",
    bordered: true,
    primary: false,
    block: true,
    onPress: constNull,
    title: I18n.t("features.fci.errors.buttons.assistance")
  };

  const footerButtons = () => {
    if (props.retry && props.assistance) {
      return [retryButtonProps, assistanceButtonProps];
    }
    if (props.retry) {
      return [retryButtonProps, closeButtonProps];
    }
    if (props.assistance) {
      return [
        {
          ...closeButtonProps,
          bordered: false,
          title: I18n.t("features.fci.errors.buttons.back")
        },
        assistanceButtonProps
      ];
    }
    return [closeButtonProps];
  };

  return (
    <BaseScreenComponent goBack={false}>
      <SafeAreaView style={IOStyles.flex} testID={props.testID}>
        <InfoScreenComponent
          image={renderInfoRasterImage(props.image)}
          title={props.title}
          body={props.subTitle}
          email={props.email}
        />

        <FooterStackButton buttons={footerButtons()} />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ErrorComponent;
