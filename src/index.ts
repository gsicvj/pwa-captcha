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
    const body = await c.req.json();
    const subscription = body.subscription;
    const payload = JSON.stringify(
      body.payload || {
        title: "Hello world",
        body: "This is a test notification",
      }
    );

    const isSent = await sendNotification(subscription, payload);
    if (isSent) {
      c.status(201);
      return c.text("OK");
    } else {
      c.status(500);
      return c.text("Error");
    }
  })
  .options("/sendNotification", async (c) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type");
    return c.text("OK");
  });

export default app;
