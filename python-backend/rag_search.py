from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from opensearchpy import OpenSearch
from rag_uploadfiles import generate_embeddings
from openai import OpenAI
from util import generateToken

generateToken()

router = APIRouter()
load_dotenv()

host = os.environ.get("OPENSEARCH_HOST")
port = os.environ.get("OPENSEARCH_PORT")
username = os.environ.get("OPENSEARCH_USERNAME")
password = os.environ.get("OPENSEARCH_PASSWORD")

header_name = os.getenv('GATEWAY_HEADER_NAME')
header_value = os.getenv('GATEWAY_HEADER_VALUE')
headers = {
    header_name: header_value
}
client = OpenAI(default_headers=headers)

# OpenSearch configuration
OPENSEARCH_CONFIG = {
    "hosts": [{"host": host, "port": port}],
    "http_auth": (username, password),
    "http_compress": True,
    "use_ssl": True,
    "verify_certs": False,
    "ssl_assert_hostname": False,
    "ssl_show_warn": False,
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
        "_source": ["content"],  # Only retrieve necessary fields
        "query": {
            "knn": {
                "embedding":{
                    "vector": query_embedding,
                    "k": 3,
                    }
                }
            }
        } 

        # Search for similar documents based on the query embedding
        response = search_client.search(index=INDEX_NAME, body=search_body)

        # Extract content and source from the documents
        documents_string = ''
        # # match_all query returns all documents, so we need to filter based on cosine similarity
        for hit in response["hits"]["hits"]:
            doc = hit["_source"]
            documents_string += doc['content'] + " "
        
        # Note: Match_all query returns all documents, so we need to filter based on cosine similarity
        
        # Challenge 3: Frame the prompt to include the query and the context in documents_string
        prompt = f"Context: {documents_string}"
        

        # Call OpenAI API
        response =  client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        )
        #Challenge 4: Call the OpenAI API to get the response for the prompt

        response_str = response.choices[0].message.content
        return JSONResponse(content={"response": response_str})

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create embedding: {str(e)}"
        )
