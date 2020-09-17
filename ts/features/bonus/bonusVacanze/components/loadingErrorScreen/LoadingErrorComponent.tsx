import { Millisecond } from "italia-ts-commons/lib/units";
import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import GenericErrorComponent from "../../../../../components/screens/GenericErrorComponent";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { bonusVacanzeStyle } from "../Styles";

export type LoadingErrorProps = {
  isLoading: boolean;
  loadingCaption: string;
  errorText?: string;
  onRetry: () => void;
  onAbort?: () => void;
};

const errorRef = React.createRef<GenericErrorComponent>();
const loadingRef = React.createRef<React.Component>();

const renderError = (props: LoadingErrorProps) => (
  <GenericErrorComponent
    onRetry={props.onRetry}
    onCancel={props.onAbort}
    text={props.errorText}
    subText={""}
    ref={errorRef}
  />
);

const renderLoading = (loadingCaption: string) => (
  <View accessible={true} ref={loadingRef} style={{ flex: 1 }}>
    <InfoScreenComponent
      image={
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
        />
      }
      title={loadingCaption}
    />
  </View>
);

const delay = 100 as Millisecond;

/**
 * This component is a generic error component composed with a loading.
 * In this way it is testable regardless of how it will be connected to the application flow.
 * This component, when {@link Props.isLoading} display a loading overlay, hiding the background, using
 * {@link withLoadingSpinner}.
 * When {@link Props.isLoading} is false, display a {@link GenericErrorComponent} displaying the reasons of the error
 * and two buttons to cancel the operation or retry.
 * @param props
 * @constructor
 */
export const LoadingErrorComponent: React.FunctionComponent<LoadingErrorProps> = props => {
  useEffect(() => {
    setAccessibilityFocus(props.isLoading ? loadingRef : errorRef, delay);
  }, [props.isLoading]);

  return (
    <SafeAreaView style={bonusVacanzeStyle.flex}>
      {props.isLoading
        ? renderLoading(props.loadingCaption)
        : renderError(props)}
    </SafeAreaView>
  );
};
