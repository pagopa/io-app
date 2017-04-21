import { Platform } from 'react-native';
import _ from 'lodash';

import variable from './../variables/platform';

export default (variables = variable) => {
  const h1Theme = {
      color: variables.textColor,
      fontSize: variables.fontSizeH1,
      fontFamily: variables.titleFontfamily,
      lineHeight: variables.lineHeightH1,
  };


  return h1Theme;
};
