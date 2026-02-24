export const SERVICES = {
  AUTH: process.env.USER_SERVICE_URL || "http://localhost:2000",
  AGENT: process.env.AGENT_SERVICE_URL || "http://localhost:1000",
};
