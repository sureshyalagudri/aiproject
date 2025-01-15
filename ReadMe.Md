# AI QGen Project

This project is a full-stack application that includes a Python backend and a React frontend. The backend uses FastAPI to serve various endpoints, and the frontend is built with React to provide a user interface for interacting with the backend.

## Backend

The backend is located in the `python-backend` directory and uses FastAPI to serve various endpoints. The main entry point is `server.py`, which includes routers for different functionalities:

- `1) askquestion.py`: Endpoint for generating interview questions.
- `2) descriptive.py`: Endpoint for generating and submitting 
- `3) mcq.py`: Endpoint for generating and submitting multiple-choice questions.

- `4) rag.py`: Endpoint for uploading and querying documents.

- `5) chat.py`: Endpoint for chat functionality.descriptive questions.

### Backend Setup

1. Navigate to the `python-backend` directory:
   ```markdown
   cd python-backend
   ```
 2. Install the required dependencies:
     ```markdown
    pip install -r requirements.txt
    ```

 3. Run the FastAPI server:
    `uvicorn server:app --reload`


### Frontend Setup

1. Navigate to the `react-app` directory:
    ```sh
    cd react-app
    ```
2. Install the required dependencies:
    ```sh
    npm install
    ```
3. Start the React development server:
    ```sh
    npm start
    ```