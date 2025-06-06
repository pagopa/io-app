export type Start = {
  type: "start";
};

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type Continue = {
  type: "continue";
};

export type Retry = {
  type: "retry";
};

export type RemoteEvents = Start | Back | Continue | Close | Retry;
