import { Hono } from "hono";
import { serveStatic } from "hono/bun";

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

export default app;
