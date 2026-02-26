export const SERVICES = {
  AGENT: process.env.AGENT_SERVICE_URL || "http://localhost:1000",
  AUTH: process.env.USER_SERVICE_URL || "http://localhost:2000",
  SCHEDULER: process.env.SCHEDULER_SERVICE_URL || "http://localhost:4000",
  FEED: process.env.FEED_SERVICE_URL || "http://localhost:5000",
};
