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
        pdf.add_page()
        
        # Add a DejaVu font that supports UTF-8 (if available) or standard font
        # For simplicity, we'll use standard fonts, but be aware of encoding issues with non-latin chars.
        # Ideally, download a .ttf font file and adding it would be better for unicode support.
        # We will strip incompatible characters or use basic encoding for now.
        pdf.set_font("Helvetica", size=12)

        # Title
        pdf.set_font("Helvetica", style="B", size=24)
        pdf.cell(0, 20, txt=f"Manual: {tool_name}", ln=True, align='C')
        pdf.ln(10)

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
                # Replace unsupported characters if necessary
                safe_line = line.encode('latin-1', 'replace').decode('latin-1')
                pdf.multi_cell(0, 8, txt=safe_line)

        # Save to temporary file
        temp_filename = f"manual_{uuid.uuid4()}.pdf"
        pdf.output(temp_filename)

        try:
            # Upload to Supabase
            file_path = f"{user_id}/{temp_filename}"
            with open(temp_filename, "rb") as f:
                supabase.storage.from_("manual-pdfs").upload(
                    file=f,
                    path=file_path,
                    file_options={"content-type": "application/pdf"}
                )
            
            # Get Public URL
            # Note: The bucket must be public for get_public_url to work
            res = supabase.storage.from_("manual-pdfs").get_public_url(file_path)
            return res

        finally:
            # Cleanup temp file
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
