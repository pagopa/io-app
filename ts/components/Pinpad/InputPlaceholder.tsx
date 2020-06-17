import { range } from "fp-ts/lib/Array";
import * as React from "react";
import { Bullet, Baseline } from './Placeholders';
import { ViewStyle, Dimensions, StyleSheet } from 'react-native';
import { View } from 'native-base';
import customVariables from '../../theme/variables';

type Props = Readonly<{
    digits: number;
    activeColor: string;
    inactiveColor: string;
    inputValue: string;
    customHorizontalMargin?: number;
}>;

const styles = StyleSheet.create({
  placeholderContainer: {
    flexDirection: "row",
    justifyContent: "center"
  }
});

const screenWidth = Dimensions.get("window").width;

const InputPlaceHolder: React.FunctionComponent<Props> = (props: Props) => {
    const placeholderPositions = range(0, props.digits - 1);
    
    const renderPlaceholder = (i: number) => {

      const { activeColor, inactiveColor, digits, customHorizontalMargin, inputValue } = props;

      const margin = customHorizontalMargin || 0;

      const isPlaceholderPopulated = i <= inputValue.length - 1;

      const scalableDimension: ViewStyle = {
        width: (screenWidth 
          - (customVariables.spacerWidth * (digits -1)) 
          - (customVariables.contentPadding * 2)
          - (margin * 2)
        ) / digits
      };
  
      return (
        <React.Fragment>
          {isPlaceholderPopulated ? (
            <Bullet
              color={activeColor}
              scalableDimension={scalableDimension}
              key={`bullet-${i}`}
            />
          ) : (
            <Baseline
              color={inactiveColor}
              scalableDimension={scalableDimension}
              key={`baseline-${i}`}
            />
          )}
          {i !== digits - 1 && (
            <View hspacer={true}/>
          )}
        </React.Fragment>
      );
    };
    
    return (
        <View style={styles.placeholderContainer}>
            {placeholderPositions.map(renderPlaceholder)}
        </View>
    )
}

export default InputPlaceHolder