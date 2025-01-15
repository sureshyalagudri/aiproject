from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json
from util import getOpenAIClient

router = APIRouter()

@router.get("/ask-question")
async def generate_question(topic: str):
    # Challenge 1.a - Write the prompt
    prompt = f""

    client = getOpenAIClient()
    # Challenge 1.b - Call OpenAI API to generate questions
    response = {}
   
    # Extract the generated text
    questions_text = response.choices[0].message.content

    # Return the questions as a JSON response
    return JSONResponse(content={"question": questions_text})

@router.post("/question-feedback")
async def submit_descriptive_questions(request: Request):
    # Request parameter includes both question and answer provided by user.
    data = await request.json()
    question = data['question']['question']
    answer = data['question']['CandidateAnswer']
    
    #Challenge 2.a - Write Prompt to evaluate the question and answer
    #Use question and answer variable to generate the prompt
    prompt = f""" 
    
                      """

    # OpenAI Call to generate feedback
    client = getOpenAIClient()
    #Challenge 2.b - Call the OpenAI API and get the resopnse
    response = {}

    # Extract the generated text
    feedback_text = response.choices[0].message.content

    # Return the feedback as a JSON response
    return JSONResponse(content={"feedback": feedback_text})
