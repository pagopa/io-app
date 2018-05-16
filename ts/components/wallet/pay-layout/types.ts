/* subtitlesLS and subtitle are mutually exclusive */
type WithSubtitle = {
  hasMainSubtitle: true;
  hasSubtitlesLR: false;
  subtitleText: string;
};

type WithoutSubtitles = {
  hasMainSubtitle: false;
  hasSubtitlesLR: false;
};

type WithSubtitlesLR = {
  hasSubtitlesLR: true;
  hasMainSubtitle: false;
  subtitleLeftText?: string;
  subtitleRightText?: string;
};

type WithTouchable = {
  hasTouchable: true;
  touchableContent: React.ReactElement<any>;
};

type WithoutTouchable = {
  hasTouchable: false;
};

export type TopContentSubtitle = WithSubtitle & WithoutTouchable;
export type TopContentSubtitlesLR = WithSubtitlesLR & WithoutTouchable;
export type TopContentTouchable = WithoutSubtitles & WithTouchable;

export type TopContentSubtitleTouchable = WithSubtitle & WithTouchable;
export type TopContentSubtitlesLRTouchable = WithSubtitlesLR & WithTouchable;
export type TopContentNone = WithoutSubtitles & WithoutTouchable;

export function topContentSubtitle(subtitleText: string): TopContentSubtitle {
  return {
    hasMainSubtitle: true,
    hasSubtitlesLR: false,
    hasTouchable: false,
    subtitleText
  };
}

export function topContentSubtitlesLR(
  subtitleLeftText?: string,
  subtitleRightText?: string
): TopContentSubtitlesLR {
  return {
    hasMainSubtitle: false,
    hasSubtitlesLR: true,
    hasTouchable: false,
    subtitleLeftText,
    subtitleRightText
  };
}

export function topContentTouchable(
  touchableContent: React.ReactElement<any>
): TopContentTouchable {
  return {
    hasMainSubtitle: false,
    hasSubtitlesLR: false,
    hasTouchable: true,
    touchableContent
  };
}

export function topContentSubtitleTouchable(
  touchableContent: React.ReactElement<any>,
  subtitleText: string
): TopContentSubtitleTouchable {
  return {
    hasMainSubtitle: true,
    hasSubtitlesLR: false,
    hasTouchable: true,
    touchableContent,
    subtitleText
  };
}

export function topContentSubtitlesLRTouchable(
  touchableContent: React.ReactElement<any>,
  subtitleLeftText?: string,
  subtitleRightText?: string
): TopContentSubtitlesLRTouchable {
  return {
    hasMainSubtitle: false,
    hasSubtitlesLR: true,
    hasTouchable: true,
    touchableContent,
    subtitleLeftText,
    subtitleRightText
  };
}

export function topContentNone(): TopContentNone {
  return {
    hasMainSubtitle: false,
    hasSubtitlesLR: false,
    hasTouchable: false
  };
}

export type TopContent =
  | TopContentSubtitle
  | TopContentSubtitleTouchable
  | TopContentSubtitlesLR
  | TopContentSubtitlesLRTouchable
  | TopContentTouchable
  | TopContentNone;
