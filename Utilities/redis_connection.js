const redis = require("redis");

const client = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});

client.on("connect", () => {
  console.log("Redis connection established");
});

client.on("end", () => {
  console.log("Redis disconnected");
});

client.on("ready", () => console.log("Redis ready to use"));

client.on("error", (err) => console.log(err));

process.on("SIGINT", () => {
  client.quit();
});

module.exports = {
  connectRedis: async () => {
    await client.connect();
  },
  redisClient: () => {
    return client;
  },
};
