import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { sendNotification, generateVAPIDKeys, setVapidDetails } from "web-push";

const app = new Hono();

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables."
  );
  console.error(generateVAPIDKeys());
  process.exit(1);
} else {
  setVapidDetails(
    "mailto:me@domenurh.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

app.get("/manifest.json", serveStatic({ path: "./manifest.json" }));
app.get("/sw.js", serveStatic({ path: "./sw.js" }));

app.get(
  "/static/*",
  serveStatic({
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`);
    },
  })
);

app.get("/", async (c) => {
  return c.html(await Bun.file("static/index.html").text());
});

app.get("/vapidPublicKey", (c) => {
  return c.text(process.env.VAPID_PUBLIC_KEY || "");
});

app.post("/register", async (c) => {
  // A real world application would store the subscription info.
  c.status(201);
  return c.text("OK");
});

app
  .post("/sendNotification", async (c) => {
    try {
      console.log("Sending notification");
      const body = await c.req.json();
      const subscription = body.subscription;
      const payload = JSON.stringify(body.data);

      await sendNotification(subscription, payload);
    } catch (error) {
      console.error("Error sending notification:", error);
      c.status(500);
      return c.text("Error");
    }
    c.status(201);
    return c.text("OK");
  })
  .options("/sendNotification", async (c) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type");
    return c.text("OK");
  });

export default app;
