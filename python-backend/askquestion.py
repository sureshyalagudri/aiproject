from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json
from openai import OpenAI
from util import generateToken
import os

generateToken()
router = APIRouter()

@router.get("/ask-question")
async def generate_question(topic: str):
    print("Generating questions for topic: ", topic)
    # Challenge 1.a - Write the prompt
   # Challenge 1.a - Write the prompt
    prompt = f"""
    You are an expert in {topic}. You will provide an interview question.
    Ensure that only one question is shown.
    Ensure that the question is prefixed with "Question:".
    Ensure that the returned question doesn't have an answer included.
    """
    header_name = os.getenv('GATEWAY_HEADER_NAME')
    header_value = os.getenv('GATEWAY_HEADER_VALUE')
    headers = {
        header_name: header_value
    }
    client = OpenAI(default_headers=headers)

    messages = [{"role": "user", "content": prompt}]
    # Challenge 1.b - Call OpenAI API to generate questions
    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=messages,
    )
  
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
    header_name = os.getenv('GATEWAY_HEADER_NAME')
    header_value = os.getenv('GATEWAY_HEADER_VALUE')
    headers = {
        header_name: header_value
    }
    client = OpenAI(default_headers=headers)

    #Challenge 2.b - Call the OpenAI API and get the resopnse
    response = {}

    # Extract the generated text
    feedback_text = response.choices[0].message.content

    # Return the feedback as a JSON response
    return JSONResponse(content={"feedback": feedback_text})
