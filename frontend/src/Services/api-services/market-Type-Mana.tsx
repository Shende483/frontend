import BaseService from '../api-base/BaseService';

export interface BrokerAccount {
  _id: string;
  brokerAccountName: string;
  brokerName: string;
}

export interface TradingRules {
  option: string[];
  future: string[];
  cash: string[];
}

export default class BrokerService extends BaseService {
  static async getBrokerDetails(marketType: string) {
    return this.get<Array<BrokerAccount>>(`brokerAccount/broker-details?marketType=${marketType}`);
  }

  static async getTradingRules(brokerAccountId: string) {
    return this.get<TradingRules>(`brokerAccount/trading-rules/${brokerAccountId}`);
  }
}