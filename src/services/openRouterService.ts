import axios from 'axios';
import type { AnalysisResult } from '../types/index.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function analyzeScreens(
  images: string[],
  context: string
): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = `
You are an expert UI/UX analyst specializing in event taxonomy. Analyze these Figma screens and identify all possible user events following these STRICT rules:

Context about this flow: ${context}

EVENT NAMING RULES:
1. Structure: {route}_{object}_{action}
   - route: Screen path (use / for hierarchy, e.g., home/credits/creditCard)
   - object: Element type (button, form, modal, tab, link, card)
   - action: User action (click, submit, view, change, select)

2. Philosophy:
   - Create fewer, more powerful events
   - Use generic events + specific properties
   - Track intentions, not just clicks
   - Keep names descriptive and non-technical
   - NEVER put context in the event name

3. Examples:
   - CORRECT: creditCard_button_click (with button_context property)
   - INCORRECT: creditCard_button_click_next

REQUIRED PROPERTIES for each event:
- screen: Full screen path
- button_context (for buttons): What the button represents (next, back, confirm, skip, etc.)
- value (if applicable): Numeric values involved
- step (for multi-step flows): Current step number or name

For each screen:
1. Identify the screen's route/path based on visual content
2. Find all interactive elements
3. Create events following the taxonomy
4. Add relevant properties for context

Return the analysis in this exact JSON format:
{
  "screens": [
    {
      "screenName": "Human-readable screen name",
      "events": [
        {
          "id": "unique_id",
          "type": "click|submit|view|change|select",
          "element": "button|form|modal|tab|link|card",
          "description": "What happens when this event occurs",
          "action": "{route}_{object}_{action}",
          "navigation": "Target screen route if applicable",
          "validation": "Validation rules if applicable",
          "properties": {
            "screen": "full/screen/path",
            "button_context": "next|back|confirm|skip (for buttons)",
            "value": 1000,
            "step": "step_name or number",
            "method": "whatsapp|app|web (if applicable)",
            "timestamp": "will be added at runtime",
            "session_id": "will be added at runtime",
            "user_id": "will be added at runtime",
            "event_id": "will be added at runtime",
            "platform": "ios|android|web"
          }
        }
      ]
    }
  ],
  "flowDescription": "Brief description of the overall flow",
  "timestamp": "ISO timestamp"
}

REMEMBER:
- Use snake_case for all event names
- Keep route hierarchy clear (home/section/subsection)
- Properties capture specifics, event names stay generic
- Every button click should have button_context property
`;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openai/o4-mini-high',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...images.map(image => ({
                type: 'image_url',
                image_url: { url: image }
              }))
            ]
          }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Figma Events Analyzer',
          'Content-Type': 'application/json'
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    return {
      ...result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing screens:', error);
    throw new Error('Failed to analyze screens. Please check your API key and try again.');
  }
}