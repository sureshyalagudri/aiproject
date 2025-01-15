import os
import openai
import numpy as np
from dotenv import load_dotenv
from opensearchpy import OpenSearch
from opensearch._1_Opensearch_CreateIndex import generate_embeddings

load_dotenv()

host = os.environ.get('OPENSEARCH_HOST')
port = os.environ.get('OPENSEARCH_PORT')
username = os.environ.get('OPENSEARCH_USERNAME')
password = os.environ.get('OPENSEARCH_PASSWORD')

# OpenSearch configuration
OPENSEARCH_CONFIG = {
    "hosts": [{"host": host, "port": port}],
    "http_auth": (username, password),
    "http_compress": True,
    "use_ssl": True,
    "verify_certs": False,
    "ssl_assert_hostname": False,
    "ssl_show_warn": False
}

INDEX_NAME = "documents"

# Commented since we are reusing the function from the other script (_1_Opensearch_Initialize_Database.py)
# def generate_embeddings(texts):
#   # Generate embeddings for the given list of texts using OpenAI API.
#   response = openai.embeddings.create(input=texts, dimensions=256, model="text-embedding-3-small")
#   embeddings = [item.embedding for item in response.data]
#   return embeddings

# Function to calculate cosine similarity
def cosine_similarity(vec1, vec2):
    """
    Calculate cosine similarity between two vectors.
    """
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# Function to retrieve documents from OpenSearch based on cosine similarity
def retrieve_documents(client, query, limit=3):
    """
    Retrieve documents from OpenSearch and calculate cosine similarity.
    """
    # Generate the embedding for the query
    query_embedding = generate_embeddings(query)

    # Perform the OpenSearch search to get documents
    search_body = {
        "size": 1000,  # Get more results initially
        "_source": ["name", "content", "embedding"],  # Only retrieve necessary fields
        "query": {
            "match_all": {}  # We'll filter based on cosine similarity in Python
        }
    }
    
    response = client.search(index=INDEX_NAME, body=search_body)
    
    # Extract documents and their embeddings
    documents = []
    for hit in response["hits"]["hits"]:
        doc = hit["_source"]
        doc_embedding = np.array(doc["embedding"])
        similarity = cosine_similarity(query_embedding, doc_embedding)
        doc["similarity"] = similarity
        documents.append(doc)

    # Sort documents by similarity in descending order and return top 'limit' documents
    documents_sorted = sorted(documents, key=lambda x: x["similarity"], reverse=True)[:limit]
    return documents_sorted

# Function to interact with OpenAI and generate a response based on the retrieved documents
def generate_chat_response(user_query, retrieved_docs):
    
    # Generate a response from OpenAI based on the user's query and the relevant documents.
    retrieved_str = "\n".join([doc["content"] for doc in retrieved_docs])
    
    openai_client = openai.OpenAI()

    completion = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant specialized about Animals."},
            {"role": "user", "content": f"Question: {user_query}"},
            {"role": "assistant", "content": f"Relevant Document: {retrieved_str}"}
        ]
    )
    
    return completion.choices[0].message.content

# Main function for testing
def main():
    # User query for information
    user_query = "I want to learn about animal sleep patterns"

    # Connect to OpenSearch
    client = OpenSearch(**OPENSEARCH_CONFIG)

    # Retrieve documents based on the user query
    retrieved_docs = retrieve_documents(client, user_query, limit=3)

    if retrieved_docs:
        # Generate a response based on the retrieved documents
        response = generate_chat_response(user_query, retrieved_docs)
        print("Response from OpenAI Assistant:", response)
    else:
        print("No relevant documents found.")

if __name__ == "__main__":
    main()