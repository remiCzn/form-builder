import z from "zod";

const envSchema = z.object({
  DB_FILENAME: z.string(),
  OPENAI_API_KEY: z.string(),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  throw new Error(`Invalid environment variables: ${envParsed.error.message}`);
}

export const env = envParsed.data;
