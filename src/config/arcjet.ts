import arcjet, {
  detectBot,
  shield,
  tokenBucket,
  slidingWindow,
} from "@arcjet/node";

if (!process.env.ARCJET_KEY && process.env.NODE_ENV !== "test") {
  throw new Error(
    "ARCJET_KEY environment variable is not set. Please set it to your Arcjet site key.",
  );
}

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "2s",
      max: 5,
    }),
  ],
});

export default aj;
