from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# --- Load environment variables ---s
load_dotenv()
key=os.getenv("GOOGLE_API_KEY")
print("Key visible to process:", bool(key))
genai.configure(api_key=key)

app = FastAPI()

# --- Enable CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev only, restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper: Load prompts dynamically ---
def load_prompt(filename: str) -> str:
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prompt_path = os.path.join(backend_dir, "prompts", filename)
    if os.path.exists(prompt_path):
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

SYSTEM_PROMPT = load_prompt("system_prompt.txt")
EVALUATOR_PROMPT = load_prompt("evaluator_prompt.txt")

# --- Helper: Build Roleplay prompt ---
def build_roleplay_prompt(user_message, chat_log, scenario):
    prev_turns = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in chat_log])

    return f"""
{SYSTEM_PROMPT}

You are roleplaying as a stakeholder in this scenario.  
Reply ONLY with the stakeholder’s next line of dialogue (1–3 sentences).  
Do NOT speak for the user.  
Do NOT summarize the whole scenario.  

After your dialogue, decide whether the conversation should:
- "continue" → if there are still unresolved issues or more steps to play out.  
- "end" → if a natural resolution has been reached (agreement, apology, decision, or clear closure), OR if the user is completely off-topic and the scenario cannot continue.  

⚠️ IMPORTANT: Output must be strict JSON only.
Do not include code fences (```), markdown, or extra text.
Return only one JSON object, in this format:

{{
  "reply": "your stakeholder message here",
  "status": "continue" OR "end"
}}

Scenario Title: {scenario['title']}
Persona: {scenario['persona']}
Context: {scenario['context']}
Country: {scenario.get('country', 'N/A')}
Stakeholders: {json.dumps(scenario.get('stakeholders', []))}
Culture Profile: {json.dumps(scenario.get('culture_profile_used', {}))}

Conversation so far:
{prev_turns}

USER just said: {user_message}
"""


# --- Helper: Build Evaluator prompt ---}
def build_evaluator_prompt(chat_log, scenario):
    full_conversation = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in chat_log])
    evaluation_rubric = scenario.get("evaluation_rubric", {})

    return f"""
{EVALUATOR_PROMPT}

Scenario Snapshot:
{json.dumps(scenario, indent=2)}

Evaluation Rubric:
{json.dumps(evaluation_rubric, indent=2)}

Conversation:
{full_conversation}
"""


# --- Health check ---
@app.get("/")
def home():
    return {"message": "Soft Skills MVP backend is running!"}

# --- Chat route (now backend-driven) ---
import re
import json

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message")
    scenario_id = data.get("scenario_id")
    chat_log = data.get("chat_log", [])

    # --- Load scenario JSON ---
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    scenario_path = os.path.join(backend_dir, "scenarios", f"{scenario_id}.json")

    if not os.path.exists(scenario_path):
        return {"reply": f"Scenario file not found at {scenario_path}"}

    with open(scenario_path, "r", encoding="utf-8") as f:
        scenario = json.load(f)

    # --- Build roleplay prompt ---
    roleplay_prompt = build_roleplay_prompt(message, chat_log, scenario)

    try:
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        roleplay_response = model.generate_content(
            roleplay_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=500,
            ),
        )

        if not hasattr(roleplay_response, "text"):
            return {"reply": "Sorry, I couldn't generate a response."}

        raw_text = roleplay_response.text.strip()

        # --- Clean model output (remove ```json etc.) ---
        clean_text = re.sub(r"^```[a-zA-Z]*\n?", "", raw_text)
        clean_text = re.sub(r"```$", "", clean_text)
        clean_text = clean_text.replace("json\n", "").strip()

        # --- Parse AI JSON ---
        try:
            ai_json = json.loads(clean_text)
        except json.JSONDecodeError:
            print("❌ JSON parsing failed. Got:", raw_text)
            return {"reply": raw_text}  # fallback

        # --- If AI says continue ---
        if ai_json.get("status") == "continue":
            return {"reply": ai_json.get("reply", "...")}

        # --- If AI says end: run evaluation ---
        elif ai_json.get("status") == "end":
            evaluator_prompt = build_evaluator_prompt(
                chat_log + [{"sender": "user", "text": message}, {"sender": "bot", "text": ai_json.get("reply", "")}],
                scenario,
            )
            evaluator_response = model.generate_content(
                evaluator_prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0,
                    max_output_tokens=1024,
                ),
            )
            eval_raw = getattr(evaluator_response, "text", "").strip()

            # Clean model output (remove code fences, stray text)
            eval_clean = re.sub(r"^```[a-zA-Z]*\n?", "", eval_raw)
            eval_clean = re.sub(r"```$", "", eval_clean)
            eval_clean = eval_clean.replace("json\n", "").strip()

            # Force JSON parsing
            try:
                evaluation_data = json.loads(eval_clean)
            except json.JSONDecodeError:
                print("❌ Evaluation JSON parsing failed. Got:", eval_raw)
                # Fallback to a minimal JSON structure instead of raw prose
                evaluation_data = {
                    "scores": {},
                    "total": 0,
                    "max": 0,
                    "feedback": ["Evaluation failed. Please retry."],
                    "raw": eval_raw
                }

            return {"evaluation": evaluation_data}

        # --- If AI JSON is malformed but had a reply ---
        else:
            return {"reply": ai_json.get("reply", raw_text)}

    except Exception as e:
        print("Roleplay AI error:", e)
        return {"reply": f"Sorry, an error occurred: {str(e)}"}
