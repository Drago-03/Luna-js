export const CONFIG = {
  LOG_DIRECTORY: './logs',
  LEARNING_INTERVAL: 1000 * 60 * 60, // 1 hour
  MAX_LOGS_SIZE: 1024 * 1024 * 10, // 10MB
  API_ENDPOINTS: {
    NEWS: 'https://api.newscatcher.p.rapidapi.com/v1/latest_headlines',
    WIKI: 'https://api.wikipedia.org/w/api.php'
  }
};