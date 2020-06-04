import * as React from "react";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
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
// TODO: maybe will be removed
export const BaseLoadingErrorScreen: React.FunctionComponent<Props> = props => {
  return (
    <BaseScreenComponent goBack={true} headerTitle={props.navigationTitle}>
      <LoadingErrorComponent {...props} />
    </BaseScreenComponent>
  );
};
