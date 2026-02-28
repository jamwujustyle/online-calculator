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
        
        prompt = f"""
        Create a technical description and a short commercial pitch for a 3D fabricated part based on this data:
        - Dimensions: {dim}
        - Volume: {vol}
        - Complexity (polygons): {poly}
        - Material: {material}
        - Technology: {technology}
        - Price: {cost}
        
        Output exactly two paragraphs separated by a single blank line.
        Paragraph 1: Technical description.
        Paragraph 2: Commercial pitch.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            texts = response.choices[0].message.content.strip().split("\n\n")
            
            if len(texts) >= 2:
                return texts[0], texts[1]
            elif len(texts) == 1:
                return texts[0], None
            return None, None
        except Exception as e:
            raise AIServiceException("Failed to generate AI content", details=str(e))
