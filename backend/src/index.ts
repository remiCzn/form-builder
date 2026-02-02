import "dotenv/config";
import { env } from "./utils/config.js";
import { api } from "./api/api.js";
import { node } from "@elysiajs/node";
import { Elysia, file } from "elysia";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia({ adapter: node() })
  .onError(({ code, request, set }) => {
    const { pathname } = new URL(request.url);
    if (
      code === "NOT_FOUND" &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/assets") &&
      request.method === "GET"
    ) {
      set.status = 200;
      return file("./dist/index.html");
    }
  })
  .use(api)
  .use(
    await staticPlugin({
      prefix: "assets",
      assets: "dist/assets",
      indexHTML: true,
    }),
  )
  .listen(env.PORT, ({ hostname, port }) => {
    console.log(`Server is running on http://${hostname}:${port}`);
  });

export type AppType = typeof app;
