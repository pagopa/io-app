import { Button, NativeBase, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

export enum FooterButtonsStyle {
  HALF, // show inline buttons -  1/2 left, 1/2 right    -> [  b1  ] [  b2  ]
  ONETHIRD, // show inline buttons - 1/3 left, 2/3 right -> [ b1 ] [   b2   ]
  FULL // show stacked buttons - full size
}

type OwnProps = {
  title: string;
};

type Props = Readonly<{
  leftButton: NativeBase.Button & OwnProps;
  rightButton: NativeBase.Button & OwnProps;
  style: FooterButtonsStyle;
}>;

const styles = {
  full: StyleSheet.create({
    footer: {},
    leftButton: {},
    rightButton: {}
  }),

  inlineHalf: StyleSheet.create({
    footer: {
      flexDirection: "row"
    },
    leftButton: {
      flex: 1,
      alignContent: "center"
    },
    rightButton: {
      flex: 1,
      alignContent: "center"
    }
  }),

  inlineOneThird: StyleSheet.create({
    footer: {
      flexDirection: "row"
    },
    leftButton: {
      flex: 1,
      alignContent: "center"
    },
    rightButton: {
      flex: 3,
      alignContent: "center"
    }
  })
};

const styleMapper = (style: FooterButtonsStyle) => {
  switch (style) {
    case FooterButtonsStyle.FULL:
      return styles.full;
    case FooterButtonsStyle.HALF:
      return styles.inlineHalf;
    case FooterButtonsStyle.ONETHIRD:
      return styles.inlineOneThird;
    default:
      return styles.full;
  }
};

/**
 * Implements a component that show 2 buttons in footer with select style FooterButtonsStyle
 */
class FooterButtons extends React.Component<Props> {
  public render() {
    const footerStyle = styleMapper(this.props.style);

    const { style: _, ...externalStyleLB } = this.props.leftButton;
    const { style: __, ...externalStyleRB } = this.props.rightButton;

    return (
      <View footer={true} style={footerStyle.footer}>
        <Button style={footerStyle.leftButton} {...externalStyleLB}>
          <Text>{this.props.leftButton.title}</Text>
        </Button>
        <View hspacer={true} />
        <View spacer={true} />
        <Button style={footerStyle.rightButton} {...externalStyleRB}>
          <Text>{this.props.rightButton.title}</Text>
        </Button>
      </View>
    );
  }
}

export default FooterButtons;
