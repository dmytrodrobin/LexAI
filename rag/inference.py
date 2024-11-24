#!/usr/bin/env python
# coding: utf-8

# # Start

# In[1]:


from langchain.graphs import Neo4jGraph
from dotenv import load_dotenv
import os

load_dotenv()

graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD")
)


# # Embedding

# In[2]:


from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

class MyEmbeddings:
        def __init__(self, model):
            self.model = SentenceTransformer(model, trust_remote_code=True)

        def normalize_vector(self, vector):
            norm = np.linalg.norm(vector)
            if norm == 0:
                return vector
            return vector / norm

        def embed_documents(self, texts: List[str]) -> List[List[float]]:
            embeddings = [self.model.encode(t) for t in texts]
            normalized_embeddings = [self.normalize_vector(embedding).tolist() for embedding in embeddings]
            return normalized_embeddings

        def embed_query(self, text: str) -> List[float]:
            embedding = self.model.encode([text])[0]
            normalized_embedding = self.normalize_vector(embedding)
            return normalized_embedding.tolist()


# In[3]:


embeding_model = MyEmbeddings('lang-uk/ukr-paraphrase-multilingual-mpnet-base')


# In[4]:


from langchain_community.vectorstores import Neo4jVector

vector_index = Neo4jVector.from_existing_graph(
    embeding_model,
    search_type="hybrid",
    node_label="Article",
    text_node_properties=["text"],
    embedding_node_property="embedding",
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD")
)


# # Retrieving

# In[5]:


from langchain_core.documents.base import Document

def custom_retrieve(query: str) -> List[Document]:
    """Return documents with a score higher than 0.8"""
    res = vector_index.similarity_search_with_relevance_scores(query, k=300)
    filtered_docs = [doc for doc, score in res if score > 0.8]
    return filtered_docs[:3]


# # RAG chain

# In[7]:

'''
from transformers import AutoTokenizer

class MistralTokenizer:
    def __init__(self, name: str):
        self.model = AutoTokenizer.from_pretrained(name, token=os.getenv("TOKEN_HF"))

    def encode(self, query: str):
      return self.model(query)['input_ids']


mistral_tokenizer = MistralTokenizer("mistralai/Mistral-7B-Instruct-v0.3")

def filter_for_quota(tokenizer, texts: List[Document]):
    max_token_count = 16000
    result_texts = []
    current_token_count = 0

    for text in texts:
        text_token_count = len(tokenizer.encode(text.page_content))
        if current_token_count + text_token_count <= max_token_count:
            result_texts.append(text)
            current_token_count += text_token_count
        else:
            break

    return result_texts
'''

# In[8]:


from langchain_mistralai import ChatMistralAI

mistral = ChatMistralAI(model="open-mistral-7b", mistral_api_key=os.getenv("MISTRAL_API_KEY"))


# In[9]:


from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


# In[10]:


template = """Here are several articles of the labor code of Ukraine. Use it to answer the question at the end.
Note that these articles are retrieved from vector store and some of them may not be as useful as others.
Be concise and not repeat legalese passages word-for-word, because the reader has access to the full text of all the documents and can read the whole thing if they want to.
Answer in Ukrainian language.

Context: {context}

Question: {question}

Helpful Answer:"""

custom_rag_prompt = PromptTemplate.from_template(template)


# In[11]:

'''
def calculate_token_length(tokenizer, text):
    return len(tokenizer.encode(text))

def format_docs(docs, tokenizer, token_limit):
    context = ""
    total_tokens = 0

    for doc in docs:
        doc_tokens = calculate_token_length(tokenizer, doc.page_content)
        if total_tokens + doc_tokens <= token_limit:
            context += doc.page_content + "\n\n"
            total_tokens += doc_tokens
        else:
            break

    return context
'''

def format_docs(docs):
    context = ""

    for doc in docs:
        context += doc.page_content + "\n\n"
            
    return context

# In[12]:


rag_chain = (
    {"context": RunnablePassthrough(), "question": RunnablePassthrough()}
    | custom_rag_prompt
    | mistral
    | StrOutputParser()
)


# In[13]:


def rag_chain_wrapper(query):
    return rag_chain.invoke({
        "context": format_docs(custom_retrieve(query)),
        "question": query
    })

