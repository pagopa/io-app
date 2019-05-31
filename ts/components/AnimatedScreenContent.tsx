/**
 * This component provides a ScrollView able to:
 * - scroll to top on its focus
 * - provide a dynanic subheader appearing on scroll
 */
import * as React from "react";
import { Animated, StyleSheet } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import customVariables from '../theme/variables';
import { View } from 'native-base';
import { ScreenContentHeader } from './screens/ScreenContentHeader';
import { ComponentProps } from '../types/react';

type OwnProps = Readonly<{
    ListEmptyComponent?: React.ReactNode;
    fixedSubHeader?: React.ReactNode;
    headerContentHeight?: number;
    interpolationVars?: ReadonlyArray<number>; //top header width, header content width, desired offset
}>;

type Props = OwnProps & ComponentProps<typeof ScreenContentHeader>;

type State = Readonly<{
    scrollY: Animated.Value;
}>;

const INITIAL_STATE = {
    scrollY: new Animated.Value(0)
};

const styles = StyleSheet.create({
    animatedSubHeader: {
        position: "absolute",
        left: 0,
        right: 0,
        overflow: "hidden"
    }
});

export default class AnimatedScreenContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = INITIAL_STATE;
    }

    private scrollableContentRef = React.createRef<any>();

    private scrollToTop = () => {
        this.scrollableContentRef.current.getNode().scrollTo({ y: 0, animated: false });
    };

    private headerHeight: number = customVariables.appHeaderHeight;

    public render(): React.ReactNode {
        const { interpolationVars } = this.props;

        const subHeaderTranslaction = interpolationVars && interpolationVars.length === 3
            ? this.state.scrollY.interpolate({
                inputRange: [
                0,
                interpolationVars[1] - interpolationVars[2],
                interpolationVars[1] + interpolationVars[2]
                ],
                outputRange: [ - ( this.headerHeight  + interpolationVars[0] ), 0, 0 ],
                extrapolate: "clamp"
            })
            : 0;
    
        return(
            <React.Fragment>
                <Animated.ScrollView
                    bounces={false}
                    ref={this.scrollableContentRef}
                    scrollEventThrottle={1}
                    onScroll={
                        Animated.event(
                            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                            { useNativeDriver: true }
                        )
                    }
                >
                    <NavigationEvents onWillFocus={this.scrollToTop} />
                    
                    <ScreenContentHeader
                        title={this.props.title}
                        icon={this.props.icon}
                        dark={this.props.dark}
                    />

                    {this.props.children}
                   
                </Animated.ScrollView>

                <Animated.View
                    style={[
                        styles.animatedSubHeader,
                        {transform: [
                            {translateY: subHeaderTranslaction}
                        ]},
                        interpolationVars && {top: - interpolationVars[0]}
                    ]}
                >   
                            <View style={interpolationVars && {height: interpolationVars[0] }}/>
                            {this.props.fixedSubHeader}
                </Animated.View>
            </React.Fragment>
        
    )};
    
}