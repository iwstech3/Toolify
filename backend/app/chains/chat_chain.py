from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.config import load_google_llm
from app.model.schemas import LLMStructuredOutput

class ChatChain:
    """A stateless, single-turn chain for conversing about tools in multiple languages."""

    def __init__(self):
        self.llm = load_google_llm()
        self.parser = PydanticOutputParser(pydantic_object=LLMStructuredOutput)
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", """You are the Gemini LLM, a helpful assistant from Google who is an expert on a wide variety of tools.
Your task is to identify the language of the user's question and respond in that same language.
You must support the following languages: English (en), French (fr), and Nigerian Pidgin (pdg).

{format_instructions}"""),
            ("human", "{question}"),
        ]).partial(format_instructions=self.parser.get_format_instructions())
        
        self.chain = self.prompt_template | self.llm | self.parser

    async def invoke_chat(self, message: str) -> LLMStructuredOutput:
        """
        Invokes the chat chain with a single user message.
        
        Args:
            message: The user's question as a string.
            
        Returns:
            An LLMStructuredOutput object containing the response and detected language.
        """
        llm_response = await self.chain.ainvoke({
            "question": message,
        })

        return llm_response

_chat_chain = ChatChain()
