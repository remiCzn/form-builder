import OpenAI from "openai";
import { env } from "../utils/config";
import createLib from "../utils/createLib";

const API_KEY = env.OPENAI_API_KEY;

const openAi: OpenAI = createLib(
	() => new OpenAI({ apiKey: API_KEY }),
	"openai",
);

export default openAi;
