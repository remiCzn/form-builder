import "dotenv/config";
import { env } from "./utils/config";
import Elysia from "elysia";
import node from "@elysiajs/node";
import { api } from "./api/api";

const app = new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia")
  .use(api)
  .listen(env.PORT, ({ hostname, port }) => {
    console.log(`Server is running on http://${hostname}:${port}`);
  });

export type AppType = typeof app;
