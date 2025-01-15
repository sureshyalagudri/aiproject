from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from util import getOpenAIClient
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from opensearchpy import OpenSearch
from rag_uploadfiles import generate_embeddings

router = APIRouter()
load_dotenv()

host = os.environ.get("OPENSEARCH_HOST")
port = os.environ.get("OPENSEARCH_PORT")
username = os.environ.get("OPENSEARCH_USERNAME")
password = os.environ.get("OPENSEARCH_PASSWORD")

# OpenSearch configuration
OPENSEARCH_CONFIG = {
    #Challenge: Set the OpenSearch configuration parameters including host, port, username, and password
}

INDEX_NAME = "files"

class searchRequest(BaseModel):
    query: str

@router.post("/search")
async def search(request: searchRequest):
    query = request.query
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Create embedding for the query
    try:
        query_embedding = generate_embeddings([query])[0]  # Get the first element of the list
        search_client = OpenSearch(**OPENSEARCH_CONFIG)
        search_body = {
            #Challenge: frame the query to retrieve 3 documents with embeddings similar to the query embedding
        }

        # Search for similar documents based on the query embedding
        response = search_client.search(index=INDEX_NAME, body=search_body)

        # Extract content and source from the documents
        documents_string = ""
        # Note: Match_all query returns all documents, so we need to filter based on cosine similarity
        
        # Challenge: Frame the prompt to include the query and the context in documents_string
        prompt = f"""

        """

        # Call OpenAI API
        response = "" #Challenge: Call the OpenAI API to get the response for the prompt

        response_str = response.choices[0].message.content
        return JSONResponse(content={"response": response_str})

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create embedding: {str(e)}"
        )
