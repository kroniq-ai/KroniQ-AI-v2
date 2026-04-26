/**
 * Robust JSON parsing that strips markdown code fences from LLM responses.
 * LLMs often return ```json\n{...}\n``` - this handles that.
 */
export function parseJSON<T = unknown>(text: string): T {
  if (!text || typeof text !== "string") throw new Error("Invalid input");
  let cleaned = text.trim();
  if (!cleaned) throw new Error("Empty input");
  // Strip markdown code blocks (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "").trim();
  // Try direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Extract JSON object or array from anywhere in text
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]) as T;
      } catch {
        // Try to find balanced braces
        const start = cleaned.indexOf("{");
        if (start >= 0) {
          let depth = 0;
          let end = -1;
          for (let i = start; i < cleaned.length; i++) {
            if (cleaned[i] === "{") depth++;
            else if (cleaned[i] === "}") {
              depth--;
              if (depth === 0) {
                end = i;
                break;
              }
            }
          }
          if (end >= 0) {
            try {
              return JSON.parse(cleaned.slice(start, end + 1)) as T;
            } catch {
              /* fall through */
            }
          }
        }
      }
    }
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try {
        return JSON.parse(arrMatch[0]) as T;
      } catch {
        /* fall through */
      }
    }
    throw new Error("Could not parse JSON");
  }
}

/** Try to parse, return null on failure */
export function tryParseJSON<T = unknown>(text: string): T | null {
  try {
    return parseJSON<T>(text);
  } catch {
    return null;
  }
}
