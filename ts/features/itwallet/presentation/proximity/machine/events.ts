export type Start = {
  type: "start";
};

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type RemoteEvents = Start | Back | Close;
