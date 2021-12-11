export interface Flow {
  messageType: string;
  time: string;
  symbol: string;
  expiration: string;
  strike: number;
  position: string;
  stockPrice: number;
  details: string;
  type: string;
  value: string;
  estimatedValue: number;
  sentiment: string;
}

export interface Alert {
  messageType: string;
  symbol: string;
  time: string;
  expiration: string;
  strike: number;
  position: string;
  sentiment: string;
  alertPrice: number;
}
