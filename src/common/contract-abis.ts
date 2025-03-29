// Common contract ABIs used throughout the application

export const EACAggregatorProxyABI = [
  'function updatePrice(int256) external',
  'function latestAnswer() view returns (int256)',
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
];

export const SubscriptionManagementABI = [
  'function subscriptionPrices(address) view returns (uint256)',
  'function purchaseSubscription(address oracle, uint256 duration) payable',
  'function isActiveSubscription(address subscriber, address oracle) view returns (bool)',
  'function setSubscriptionPrice(address oracle, uint256 price) external',
];

export const ONE_YEAR_SECONDS = 31536000; // 365 days in seconds
