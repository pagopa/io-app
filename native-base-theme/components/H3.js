import { Platform } from 'react-native';
import _ from 'lodash';

import variable from './../variables/platform';

export default (variables = variable) => {
  const h3Theme = {
      color: variables.textColor,
      fontSize: variables.fontSizeH3,
      fontFamily: variables.titleFontfamily,
      lineHeight: variables.lineHeightH3,
  };


  return h3Theme;
};
