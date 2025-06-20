export type ScreenEvent = {
  screenName: string;
  events: UIEvent[];
};

export type UIEvent = {
  id: string;
  type: string;
  element: string;
  description: string;
  action: string;
  navigation?: string;
  validation?: string;
  properties?: {
    screen: string;
    button_context?: string;
    value?: number;
    step?: string | number;
    method?: string;
    timestamp?: string;
    session_id?: string;
    user_id?: string;
    event_id?: string;
    platform?: string;
    [key: string]: any;
  };
};

export type AnalysisResult = {
  screens: ScreenEvent[];
  flowDescription: string;
  timestamp: string;
};