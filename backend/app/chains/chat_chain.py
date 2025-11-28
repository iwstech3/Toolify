from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from app.config import load_google_llm
from app.model.schemas import LLMStructuredOutput

# Global store for chat histories
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

class ChatChain:
    """A stateful chain for conversing about tools in multiple languages."""

    def __init__(self):
        self.llm = load_google_llm()
        self.parser = PydanticOutputParser(pydantic_object=LLMStructuredOutput)
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", """You are the Gemini LLM, a helpful assistant from Google who is an expert on a wide variety of tools.
Your task is to identify the language of the user's question and respond in that same language.
You must support the following languages: English (en), French (fr), and Nigerian Pidgin (pdg).

{format_instructions}"""),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}"),
        ]).partial(format_instructions=self.parser.get_format_instructions())
        
        # Chain that returns the raw LLM output (AIMessage)
        self.llm_chain = self.prompt_template | self.llm
        
        # Wrap with history
        self.chain_with_history = RunnableWithMessageHistory(
            self.llm_chain,
            get_session_history,
            input_messages_key="question",
            history_messages_key="history",
        )
        
        # Final chain: History-aware LLM -> Parser
        self.chain = self.chain_with_history | self.parser

    async def invoke_chat(self, message: str, session_id: str) -> LLMStructuredOutput:
        """
        Invokes the chat chain with a user message and session ID.
        
        Args:
            message: The user's question as a string.
            session_id: The session ID for conversation memory.
            
        Returns:
            An LLMStructuredOutput object containing the response and detected language.
        """
        llm_response = await self.chain.ainvoke(
            {"question": message},
            config={"configurable": {"session_id": session_id}}
        )

        return llm_response

_chat_chain = ChatChain()
