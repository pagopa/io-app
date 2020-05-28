import * as React from "react";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ScreenContent from "../../../../components/screens/ScreenContent";
import {
  LoadingErrorComponent,
  LoadingErrorProps
} from "./LoadingErrorComponent";

type OwnProps = {
  navigationTitle: string;
};

type Props = OwnProps & LoadingErrorProps;

/**
 * @param props
 * @constructor
 */
export const BaseLoadingErrorScreen: React.FunctionComponent<Props> = props => {
  return (
    <BaseScreenComponent goBack={true} headerTitle={props.navigationTitle}>
      <ScreenContent bounces={false}>
        <LoadingErrorComponent {...props} />
      </ScreenContent>
    </BaseScreenComponent>
  );
};
