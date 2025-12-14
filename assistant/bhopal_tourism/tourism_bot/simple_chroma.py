from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

class SimpleTourismDB:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2"
        )
        
        self.vector_store = Chroma(
            collection_name="bhopal_tourism",
            embedding_function=self.embeddings,
            persist_directory="./chroma_langchain_db",
        )
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7
        )
        
        self.retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k":4}
        )
        
        chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(
                """You are a helpful and knowledgeable Bhopal tourism assistant. You are enthusiastic about Bhopal 
                and want to help visitors have amazing experiences.

PERSONALITY & TONE:
- Warm, friendly, and welcoming
- Enthusiastic about Bhopal's attractions
- Helpful and informative
- Use a conversational tone

RESPONSE GUIDELINES:

1. **General Conversations** (greetings, thanks, casual chat):
   - Be naturally friendly and welcoming
   - Use your general knowledge to be helpful
   - Respond appropriately to the specific greeting or comment

2. **Specific Factual Questions** (timings, prices, addresses, specific details):
   - Use ONLY the provided context information
   - If the specific fact isn't in the context, respond: "I don't have that specific information in my database right now, but I'd be happy to help with other questions about Bhopal tourism!"
   - Be precise with facts like timings, prices, distances

3. **Booking Queries** (when users want to book tickets, make reservations, buy passes):
   - Acknowledge booking requests warmly: "I'd be happy to help you with booking!"
   - Provide relevant information from context about the attraction they want to visit
   - Ask for details: "Which attraction would you like to book tickets for?"
   - Offer to help with the booking process: "I can help you with the booking details!"

4. **General Tourism Questions**:
   - Combine context information with enthusiastic recommendations
   - Suggest related attractions or experiences
   - Provide helpful tips when appropriate

Remember: You can be conversational and friendly, but be careful about specific facts - only use information from the provided context for factual details."""
            ),
            HumanMessagePromptTemplate.from_template(
                """Based on the following context about Bhopal tourism, please answer the user's question:

CONTEXT:
{context}

USER QUESTION: {question}

Please provide a helpful response following the guidelines above."""
            )
        ])
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": chat_prompt}
        )
    
    def load_documents_from_data_folder(self):
        """Load all text files from data folder using DirectoryLoader"""
        # Load documents from data folder
        loader = DirectoryLoader(
            "C:\\Users\\abhij\\OneDrive\\Desktop\\newAssistant\\assistant\\data", 
            glob="**/*.txt",  # Load all .txt files
            show_progress=True
        )
        docs = loader.load()
        print(f"✅ Loaded {len(docs)} documents from data folder")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        split_docs = text_splitter.split_documents(docs)
        
        if split_docs:
            self.vector_store.add_documents(split_docs)
        
        return split_docs
    
    def search(self, query, k=3):
        results = self.vector_store.similarity_search(query, k=k)
        return results
    
    def search_with_scores(self, query, k=3):
        results = self.vector_store.similarity_search_with_score(query, k=k)
        return results
    
    def ask_question(self, question):
        # Ask a question and get RAG response using Gemini
        try:
            response = self.qa_chain.invoke({"query": question})
            return {
                "answer": response["result"],
                "sources": [doc.metadata.get("source", "Unknown") for doc in response["source_documents"]]
            }
        except Exception as e:
            return {
                "answer": f"Sorry, I encountered an error: {str(e)}",
                "sources": []
            }
    
    

def test_setup():
    # Test RAG system with ChromaDB + Gemini 1.5 Flash
    db = SimpleTourismDB()
    
    try:
        test_results = db.search("test", k=1)
        if test_results:
            print("✅ Data already loaded in ChromaDB")
        else:
            print("📁 Loading documents from data folder...")
            docs = db.load_documents_from_data_folder()
    except:
        print("📁 Loading documents from data folder...")
        docs = db.load_documents_from_data_folder()
    
    # Test Gemini RAG system
    print("\n" + "="*70)
    print("🤖 TESTING GEMINI 1.5 FLASH RAG RESPONSES")
    print("="*70)
    
    test_questions = [
        "What are the best places to visit in Bhopal?",
        "Tell me about Taj-ul-Masajid mosque",
        "What activities can I do at Upper Lake?",
        "What is the best time to visit Bhopal?"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n🔥 TEST {i}: {question}")
        print("-" * 50)
        
        if i == 1:
            # Show detailed process for first question
            response = db.test_gemini_response(question)
        else:
            response = db.ask_question(question)
    
    return db
    
    if docs:
        results = db.search("places to visit in Bhopal")
    
    return db

if __name__ == "__main__":
    test_setup()