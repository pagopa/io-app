import React from "react";
import { View, StyleSheet } from "react-native";
import {
  ButtonLink,
  ButtonSolid,
  H3,
  IOPictograms,
  IOStyles,
  LabelSmall,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";

type ActionProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

type ItwContinueViewProps = {
  title: string;
  pictogram?: IOPictograms;
  subtitle?: string;
  action?: ActionProps;
  secondaryAction?: ActionProps;
  closeAction?: ActionProps["onPress"];
};

/**
 * The base graphical component to show a pictogram, title, a subtitle, an action button and a secondary action button.
 * This works as a "continue" screen.
 * This component must be used to show a result screen to keep the same style across the flow.
 * @param title the title to be rendered
 * @param subtitle the subtitlte to be rendered below the title (optional)
 * @param action the continue button to be rendered (optional)
 * @param secondaryAction the secondary cancel button to be rendered (optional)
 */
const ItwContinueView = ({
  title,
  pictogram,
  subtitle,
  action,
  secondaryAction
}: ItwContinueViewProps): React.ReactElement => (
  <View style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}>
    <View style={styles.main} testID={"ItwContinueViewTestID"}>
      {pictogram && (
        <>
          <Pictogram name={pictogram} size={180} />
          <VSpacer size={24} />
        </>
      )}
      <H3 style={styles.text}>{title}</H3>
      {subtitle && (
        <>
          <VSpacer size={8} />
          <LabelSmall style={styles.text} color="grey-650" weight="Regular">
            {subtitle}
          </LabelSmall>
        </>
      )}
    </View>
    {(action || secondaryAction) && (
      <View style={styles.footer}>
        {action && (
          <>
            <VSpacer size={24} />
            <View>
              <ButtonSolid {...action} fullWidth />
            </View>
          </>
        )}
        {secondaryAction && (
          <View style={styles.secondaryAction}>
            <VSpacer size={24} />
            <ButtonLink {...secondaryAction} />
          </View>
        )}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  footer: {
    justifyContent: "center",
    flexDirection: "column",
    paddingBottom: IOStyles.footer.paddingBottom
  },
  secondaryAction: {
    alignSelf: "center"
  },
  text: {
    textAlign: "center"
  }
});

export default ItwContinueView;
