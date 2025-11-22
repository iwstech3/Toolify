from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from app.config import load_google_llm


class ToolManualChain:
    """Chain for generating comprehensive tool manuals using Gemini"""
    
    def __init__(self):
        self.llm = load_google_llm()
        self.output_parser = StrOutputParser()
    
    def generate_manual(
        self,
        tool_name: str,
        research_context: str,
        tool_description: str = None,
        language: str = "en"
    ) -> str:
        """
        Generate a comprehensive tool manual from research data
        
        Args:
            tool_name: Name of the tool
            research_context: Research data from Tavily
            tool_description: Optional description from Google Vision
            language: Output language
            
        Returns:
            Comprehensive tool manual as string
        """
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", """You are an expert technical writer specializing in tool manuals and user guides. 
Your task is to create clear, comprehensive, and user-friendly manuals for tools based on research data.
Always write in a professional yet accessible tone."""),
            ("human", """Create a comprehensive user manual for the tool: {tool_name}

{tool_description_section}

Research Information:
{research_context}

Please create a detailed, well-structured manual that includes:

## 1. Tool Overview
- What is this tool?
- What is it used for?
- Key applications

## 2. Key Features and Specifications
- Main features
- Technical specifications (if available)
- Different types or variations

## 3. Safety Precautions
- Important safety warnings
- Protective equipment needed
- Common hazards to avoid

## 4. Step-by-Step Usage Guide
- Pre-use preparation
- Detailed operation instructions
- Post-use procedures

## 5. Tips and Best Practices
- Expert recommendations
- Efficiency tips
- Common techniques

## 6. Common Mistakes to Avoid
- Frequent user errors
- What NOT to do
- Troubleshooting common issues

## 7. Maintenance and Care
- Cleaning procedures
- Storage recommendations
- Maintenance schedule
- When to replace parts

## 8. Additional Resources
- Reference to video tutorials (if mentioned in research)
- Further reading suggestions

Format the manual with clear headings, bullet points, and numbered lists where appropriate.
Write in {language} language.
Be thorough but concise. Aim for a manual that is both informative and easy to follow.""")
        ])
        
        # Build tool description section if available
        tool_description_section = ""
        if tool_description:
            tool_description_section = f"Tool Description (from image recognition):\n{tool_description}\n"
        
        # Create the chain
        chain = prompt_template | self.llm | self.output_parser
        
        # Generate the manual
        manual = chain.invoke({
            "tool_name": tool_name,
            "tool_description_section": tool_description_section,
            "research_context": research_context,
            "language": language
        })
        
        return manual
    
    def generate_quick_summary(
        self,
        tool_name: str,
        research_context: str,
        language: str = "en"
    ) -> str:
        """
        Generate a quick summary of the tool (2-3 sentences)
        
        Args:
            tool_name: Name of the tool
            research_context: Research data from Tavily
            language: Output language
            
        Returns:
            Brief summary as string
        """
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are a technical expert providing concise tool descriptions."),
            ("human", """Based on this research about {tool_name}:

{research_context}

Provide a brief 2-3 sentence summary that explains:
1. What this tool is
2. What it's primarily used for

Write in {language} language. Be concise and informative.""")
        ])
        
        chain = prompt_template | self.llm | self.output_parser
        
        summary = chain.invoke({
            "tool_name": tool_name,
            "research_context": research_context,
            "language": language
        })
        
        return summary
    
    def generate_safety_guide(
        self,
        tool_name: str,
        research_context: str,
        language: str = "en"
    ) -> str:
        """
        Generate focused safety guidelines for the tool
        
        Args:
            tool_name: Name of the tool
            research_context: Research data from Tavily
            language: Output language
            
        Returns:
            Safety guide as string
        """
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are a safety expert specializing in tool usage and workplace safety."),
            ("human", """Based on this research about {tool_name}:

{research_context}

Create a focused safety guide that includes:

## Safety Precautions for {tool_name}

### Essential Safety Equipment
- List required protective gear

### Before Use
- Safety checks to perform
- Environmental considerations

### During Use
- Critical safety rules
- What to watch out for

### After Use
- Safe shutdown procedures
- Storage safety

### Emergency Procedures
- What to do if something goes wrong
- First aid considerations

Write in {language} language. Prioritize user safety above all else.""")
        ])
        
        chain = prompt_template | self.llm | self.output_parser
        
        safety_guide = chain.invoke({
            "tool_name": tool_name,
            "research_context": research_context,
            "language": language
        })
        
        return safety_guide


# Create singleton instance
tool_manual_chain = ToolManualChain()