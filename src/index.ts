import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { sendNotification } from "web-push";

const app = new Hono();

app.get("/manifest.json", serveStatic({ path: "./manifest.json" }));
app.get("/sw.js", serveStatic({ path: "./static/sw.js" }));

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
  return c.text("PROBABLY_NOT_A_SECRET");
});

app.post("/register", async (c) => {
  // A real world application would store the subscription info.
  return c.status(201);
});

app.post("/sendNotification", async (c) => {
  const body = await c.req.json();
  const subscription = body.subscription;
  const payload = body.payload || "Hello world";

  await sendNotification(subscription, payload);

  return c.status(201);
});

export default app;
