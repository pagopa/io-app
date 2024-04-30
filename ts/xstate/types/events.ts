export interface Next {
  readonly type: "next";
}
export interface Back {
  readonly type: "back";
  readonly skipNavigation?: boolean;
}

export interface Close {
  readonly type: "close";
}

export type GlobalEvents = Next | Back | Close;
