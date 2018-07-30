import * as React from "react";
import { StyleSheet } from "react-native";
import { Button, View, Text, NativeBase } from "native-base";

export enum FooterButtonsStyle {
    HALF,
    ONETHIRD,
    FULL
}

type OwnProps = {
    title: string
}

type Props = Readonly<{
    primaryButton: NativeBase.Button & OwnProps;
    secondaryButton: NativeBase.Button & OwnProps;
    style: FooterButtonsStyle;
  }>;

const styles = {
    full: StyleSheet.create({
        footer: {},
        primaryButton: {},
        secondaryButton: {}
    }),

    inlineHalf: StyleSheet.create({
        footer: {
            flexDirection: "row"
        },
        primaryButton: { 
            flex: 1,
            alignContent: "center"
        },
        secondaryButton: { 
            flex: 1,
            alignContent: "center"
        }
    }),

    inlineOneThird: StyleSheet.create({
        footer: {
            flexDirection: "row"
        },
        primaryButton: { 
            flex: 3,
            alignContent: "center"
        },
        secondaryButton: { 
            flex: 1,
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
}

class FooterButtons extends React.Component<Props>{

    render() {

        const footerStyle = styleMapper(this.props.style);

        this.props.primaryButton.style = footerStyle.primaryButton;
        this.props.secondaryButton.style = footerStyle.secondaryButton;

        return (
            <View footer={true} style={footerStyle.footer}>
                <Button {...this.props.primaryButton}>
                <Text>{this.props.primaryButton.title}</Text> </Button>
                <View hspacer={true} />
                <View spacer={true} />
                <Button  {...this.props.secondaryButton}>
                <Text>{this.props.secondaryButton.title}</Text>
                </Button>
            </View>
        );
    }
}

export default FooterButtons;
