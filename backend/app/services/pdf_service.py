import os
import uuid
from fpdf import FPDF
from app.config import supabase

class PDFService:
    @staticmethod
    def create_manual_pdf(tool_name: str, manual_content: str, user_id: str) -> str:
        """
        Generates a PDF for the tool manual and uploads it to Supabase.
        Returns the public URL of the uploaded PDF.
        """
        pdf = FPDF()
        pdf.set_margins(20, 20, 20)
        pdf.add_page()
        
        # Title
        pdf.set_font("Helvetica", style="B", size=24)
        # Use multi_cell for title too in case tool_name is long
        pdf.multi_cell(0, 15, txt=f"Manual: {tool_name}", align='C')
        pdf.ln(5)

        # Content
        pdf.set_font("Helvetica", size=12)
        
        # Simple markdown-like parsing (very basic)
        # We just split by newlines and print
        for line in manual_content.split('\n'):
            line = line.strip()
            if not line:
                pdf.ln(5)
                continue
            
            # Check for headers
            if line.startswith('# '):
                pdf.set_font("Helvetica", style="B", size=18)
                pdf.multi_cell(0, 10, txt=line.replace('# ', ''))
                pdf.set_font("Helvetica", size=12)
            elif line.startswith('## '):
                pdf.set_font("Helvetica", style="B", size=16)
                pdf.multi_cell(0, 10, txt=line.replace('## ', ''))
                pdf.set_font("Helvetica", size=12)
            elif line.startswith('### '):
                pdf.set_font("Helvetica", style="B", size=14)
                pdf.multi_cell(0, 10, txt=line.replace('### ', ''))
                pdf.set_font("Helvetica", size=12)
            elif line.startswith('**') and line.endswith('**'):
                pdf.set_font("Helvetica", style="B", size=12)
                pdf.multi_cell(0, 8, txt=line.replace('**', ''))
                pdf.set_font("Helvetica", size=12)
            else:
                # Regular text
                # Replace unsupported characters
                # Encode to latin-1 and replace errors to avoid codec issues
                try:
                    safe_line = line.encode('latin-1', 'replace').decode('latin-1')
                    # Basic check for very long words that might break multi_cell
                    # This is a naive fix; robust wrapping is complex without a library like textwrap
                    # but multi_cell handles spaces. Long URLs/tokens are the issue.
                    # We'll force wrap by character if needed by relying on multi_cell but ensuring no single word is wider than page
                    # For now, just the encoding fix and standard multi_cell should be enough for most cases
                    # unless a specific long string (like a URL) is present.
                    pdf.multi_cell(0, 8, txt=safe_line)
                except Exception as e:
                    print(f"Error rendering line in PDF: {e}")
                    continue

        # Save to temporary file
        temp_filename = f"manual_{uuid.uuid4()}.pdf"
        pdf.output(temp_filename)

        try:
            # Upload to Supabase
            file_path = f"{user_id}/{temp_filename}"
            with open(temp_filename, "rb") as f:
                supabase.storage.from_("tool-images").upload(
                    file=f,
                    path=file_path,
                    file_options={"content-type": "application/pdf"}
                )
            
            # Get Public URL
            # Note: The bucket must be public for get_public_url to work
            res = supabase.storage.from_("tool-images").get_public_url(file_path)
            return res

        finally:
            # Cleanup temp file
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
