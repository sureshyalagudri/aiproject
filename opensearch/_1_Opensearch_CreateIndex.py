import os
import openai
from dotenv import load_dotenv
from opensearchpy import OpenSearch
from opensearchpy.helpers import bulk

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

INDEX_NAME = "files"

# Function to generate embeddings using OpenAI
def generate_embeddings(texts):

    # Generate embeddings for the given list of texts using OpenAI API.
    response = openai.embeddings.create(input=texts, dimensions=256, model="text-embedding-3-small")
    embeddings = [item.embedding for item in response.data]
    return embeddings

# Function to create OpenSearch index with knn_vector mapping
def create_opensearch_index(client):
    """
    Create the OpenSearch index with knn_vector mapping for embeddings.
    """
    index_body = {
        "settings": {
                "index": {
                    "knn": True  # Enable k-NN
                },
        },
        "mappings": {
            "properties": {
                "id": {"type": "long"},  # ID field (similar to serial)
                "name": {"type": "text"},  # Text field for the document name
                "content": {"type": "text"},  # Text field for the document content
                "embedding": {
                "type": "knn_vector",
                "dimension": 256,
                "method": {
                    "name": "hnsw",
                    "space_type": "cosinesimil",
                    "engine": "nmslib"
                }
                },
                "created_at": {"type": "date"},  # Timestamp field for created_at
                "updated_at": {"type": "date"}  # Timestamp field for updated_at
            }
        }
    }

    if not client.indices.exists(INDEX_NAME):
        client.indices.create(index=INDEX_NAME, body=index_body)
        print(f"Index '{INDEX_NAME}' created.")


# Main function to generate embeddings and insert documents
def main():
    # Mock documents array with fun facts
    # Connect to OpenSearch
    client = OpenSearch(**OPENSEARCH_CONFIG)

    # Create the OpenSearch index
    create_opensearch_index(client)

   

if __name__ == "__main__":
    main()