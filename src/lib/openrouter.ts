/**
 * OpenRouter API client - Hunter Alpha only
 */

import OpenAI from "openai";
import {
  selectModel,
  estimateTokens,
  type TaskType,
} from "./model-router";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const REQUEST_TIMEOUT_MS = 120_000;

export async function callOpenRouter(params: {
  model?: string;
  task_type: TaskType;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
}): Promise<string> {
  const key = params.apiKey || process.env.OPENROUTER_KEY;
  if (!key) {
    throw new Error("OPENROUTER_KEY not set. Add it to .env.local");
  }

  const model =
    params.model ||
    process.env.OPENROUTER_MODEL ||
    selectModel({
      task_type: params.task_type,
      prompt: params.systemPrompt + params.userPrompt,
      token_estimate: estimateTokens(params.systemPrompt + params.userPrompt),
    });

  const client = new OpenAI({
    apiKey: key,
    baseURL: OPENROUTER_BASE,
  });

  const completion = await Promise.race([
    client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
      temperature: 0.7,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timed out (${REQUEST_TIMEOUT_MS / 1000}s)`)),
        REQUEST_TIMEOUT_MS
      )
    ),
  ]);

  const content = completion.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Empty response from model");
  }
  return content.trim();
}
