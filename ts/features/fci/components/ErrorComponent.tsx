import * as React from "react";
import { SafeAreaView } from "react-native";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { WithTestID } from "../../../types/WithTestID";
import { InfoScreenComponent } from "./InfoScreenComponent";

type Props = WithTestID<{
  title: string;
  subTitle: string;
  image: number;
  email?: EmailString;
  retry?: boolean;
  onPress: () => void;
}>;

const ErrorComponent = (props: Props) => {
  const buttonProps = {
    block: true,
    primary: true,
    onPress: props.onPress
  };

  const closeButtonProps = {
    ...buttonProps,
    bordered: true,
    title: I18n.t("global.buttons.close")
  };

  const retryButtonProps = {
    ...buttonProps,
    title: I18n.t("global.buttons.retry")
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

        <FooterWithButtons
          type={"SingleButton"}
          leftButton={props.retry ? retryButtonProps : closeButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ErrorComponent;
