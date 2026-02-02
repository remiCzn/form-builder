import "dotenv/config";
import { env } from "./utils/config.js";
import { api } from "./api/api.js";
import { node } from "@elysiajs/node";
import { Elysia } from "elysia";

const app = new Elysia({ adapter: node() })
  .use(api)
  .listen(env.PORT, ({ hostname, port }) => {
    console.log(`Server is running on http://${hostname}:${port}`);
  });

export type AppType = typeof app;
