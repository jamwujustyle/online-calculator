from openai import OpenAI
from config import settings
from typing import Tuple, Optional
import models
from exceptions import AIServiceException

class AIService:
    def __init__(self):
        # Add graceful fallback if key is not set, or OpenAI fails to import properly
        try:
            self.client = OpenAI(api_key=settings.openai_api_key)
        except Exception:
            self.client = None

    def generate_ai_texts(self, project: models.Project) -> Tuple[Optional[str], Optional[str]]:
        """
        Generates AI texts for a project based on its parameters.
        Returns a tuple of (description: Optional[str], commercial_text: Optional[str]).
        """
        if self.client is None:
            raise AIServiceException("AI Service is not configured (missing API key)")
        if not project.calculated_results:
            return None, None
            
        dim = f"{project.dim_x:.1f}x{project.dim_y:.1f}x{project.dim_z:.1f} mm" if project.dim_x else "Unknown"
        vol = f"{project.volume_mm3:.1f} mm3" if project.volume_mm3 else "Unknown"
        poly = f"{project.poly_count}" if project.poly_count else "Unknown"
        
        cost = project.calculated_results.get("total_price", "Unknown")
        material = project.production_params.get("material", "Unknown")
        technology = project.production_params.get("technology", "Unknown")
        
        # we put static content in the beginning to enable prefix caching
        system_prompt = """[3D_CALC_STATIC_INSTRUCTIONS]
Assistant for industrial 3D printing. Generate content exactly in this structure:
1. Reasoning (max 50 chars, single line)
2. Technical Description (single paragraph)
3. Commercial Pitch (single paragraph)

Output MUST follow this format strictly with no extra text or labels.
"""
        # Dynamic data passed as user prompt
        user_data = f"""DATA:
- Dim: {dim}
- Vol: {vol}
- Poly: {poly}
- Mat: {material}
- Tech: {technology}
- Price: {cost}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_data}
                ],
                temperature=0.7,
                max_tokens=250
            )
            content = response.choices[0].message.content.strip()
            lines = content.split("\n")
            
            # Extract reasoning (first line)
            reasoning = lines[0] if lines else ""
            print(f"DEBUGGER AI REASONING: {reasoning[:50]}")
            
            # Filter paragraphs (skip empty and reasoning)
            paragraphs = [l.strip() for l in lines[1:] if l.strip()]
            
            if len(paragraphs) >= 2:
                return paragraphs[0], paragraphs[1]
            elif len(paragraphs) == 1:
                return paragraphs[0], None
            return None, None
        except Exception as e:
            raise AIServiceException("Failed to generate AI content", details=str(e))
