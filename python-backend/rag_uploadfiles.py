from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from langchain_text_splitters import RecursiveCharacterTextSplitter
import io
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import uuid
import tempfile
from dotenv import load_dotenv
from opensearchpy import OpenSearch
from opensearchpy.helpers import bulk
from openai import OpenAI
from util import generateToken

generateToken()

router = APIRouter()

host = os.environ.get("OPENSEARCH_HOST")
port = os.environ.get("OPENSEARCH_PORT")
username = os.environ.get("OPENSEARCH_USERNAME")
password = os.environ.get("OPENSEARCH_PASSWORD")

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

def generate_embeddings(texts):
    client = OpenAI()  # Get the OpenAI client
    # Generate embeddings using OpenAI API
    response = client.embeddings.create(
        input=texts, dimensions=256, model="text-embedding-3-large"
    )
    # Extract embeddings from the response
    embeddings = [item.embedding for item in response.data]
    return embeddings


def insert_documents(search_client, fileChunks, embeddings, fileMetadata):
    documents = []  # List to hold bulk actions
    for i, item in enumerate(fileMetadata):
        # Create an document object   
        document = {
            "_index": INDEX_NAME,
            "_id": str(uuid.uuid4()),  # Generate a unique GUID for the document ID
            "_source": {
                "name":  os.path.basename(item["source"]),  # Document source name without absolute path
                "content": fileChunks[i],  # Document content
                "embedding": embeddings[i],  # Document embedding
            },
        }
        documents.append(document)  # Add document to the list

    # Perform bulk insert into OpenSearch
    success, _ = bulk(search_client, documents)
    print(f"Successfully inserted {success} documents into OpenSearch.")


#Challenge 1: Implement the retrieve_all_documents function to retrieve all documents from OpenSearch index files.
def retrieve_all_documents(client):
    # Perform the OpenSearch search to get ALL documents
    # query should as here: "query": {"match_all": {}},
    search_body = {
        
    }
    response = client.search(index=INDEX_NAME, body=search_body)
    return response


@router.get("/rag/files")
async def get_files():
    try:
        # Connect to OpenSearch
        client = OpenSearch(**OPENSEARCH_CONFIG)
        search_results = retrieve_all_documents(client)
        # Challenge2: Get hits (replace "" with relevant code) Note: Debug and find the object structure from search results.
        hits = ""
        # To get only distinct files
        sources = []  # List to hold file names
        for hit in hits:
            source_name = hit["_source"]["name"]
            fileName = os.path.basename(source_name)
            if fileName not in sources:
                sources.append(fileName)  # To Remove the absolute path and get only the file name
        return JSONResponse(content={"sources": sources})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/rag/upload")
 # Save the text content to OpenSearch index by name files
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return JSONResponse(
            content={"error": "Only PDF files are allowed"}, status_code=400
        )
    try:
        # Read the uploaded file
        contents = await file.read()
        pdf_stream = io.BytesIO(contents)

        # Get original filename and sanitize it
        filenamewithoutExt = file.filename.rsplit(".", 1)[0]  # Remove the file extension
        safe_filename = "".join(
            [c for c in filenamewithoutExt if c.isalnum() or c in ("-", "_")]
        )
        safe_filename += ".pdf"  # Ensure the filename ends with .pdf

        # Create temporary file with original name in temp directory
        temp_path = os.path.join(tempfile.gettempdir(), safe_filename)
        # Write the PDF content to the temporary file
        with open(temp_path, "wb") as temp_file:
            temp_file.write(pdf_stream.getvalue())

        try:
            # Use temporary file with PyPDFLoader
            loader = PyPDFLoader(temp_path)
            text_content = loader.load()

            # Split the docs and create embeddings
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=3000, chunk_overlap=100
            )
            # Split the text content into chunks
            chunks = text_splitter.split_documents(text_content)

            pages_content = []
            pages_metadata_content = []
            for chunk in chunks:
                pages_content.append(chunk.page_content)
                pages_metadata_content.append(chunk.metadata)

            # Generate embeddings for the pages
            embeddings = generate_embeddings(pages_content)
            # Connect to OpenSearch
            client = OpenSearch(**OPENSEARCH_CONFIG)
            # Insert the documents into OpenSearch
            insert_documents(client, pages_content, embeddings, pages_metadata_content)
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
        return JSONResponse(
            content={
                "message": "File uploaded and processed successfully",
                "filename": file.filename,
                "size": len(contents),
                "text_length": len(text_content),
            }
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
