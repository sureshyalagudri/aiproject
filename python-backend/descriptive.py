from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json
import re
from openai import OpenAI
import os
from util import generateToken

router = APIRouter()
generateToken()
header_name = os.getenv('GATEWAY_HEADER_NAME')
header_value = os.getenv('GATEWAY_HEADER_VALUE')
headers = {
    header_name: header_value
 }
client = OpenAI(default_headers=headers)


@router.get("/generate-questions")
async def generate_questions(topic: str):
    # Challenge 1.a - Write a prompt as in requirement document. Use {topic} variable to include the topic in the prompt
    prompt = f"""
    You are an expert in {topic}. You will provide an interview question.
    Ensure that only three question is shown.
    Ensure that the returned question doesn't have an answer included.
    """

    systemPrompt = f"""
    You are an expert in {topic}. 
    Please use the below json format for output:
    [
        {{
            "Id": 1,
            "Question": "sample question",
            "ExpectedAnswer": "sample answer" 
        }}
    ]
    """

    # Challenge 1.b - Call OpenAI API to generate questions using prompt variable
    messages = [
        {"role": "system", "content": systemPrompt},
        {"role": "user", "content": prompt}
        ]

    response = client.chat.completions.create(
        model="gpt-4o-2024-05-13",
        messages=messages,
        temperature=0.2,
    )

    # Extract the generated text and convert it to JSON
    questions_text = response.choices[0].message.content

    # Challenge 1.c - Remove extra characters from response if present
    questions_json_str = re.sub(r'[^\x00-\x7F]+', '', questions_text)

    # For model 08-13 use following regex
    #questions_json_str = re.sub(r"^```json|```$", "", questions_text.strip())
      
    # Load the questions as JSON object from the text 
    questions_json = json.loads(questions_json_str)
    # Return the questions as a JSON response
    return JSONResponse(content={"questions": questions_json})


@router.post("/submitdescriptivequestions")
async def submit_descriptive_questions(request: Request):
    data = await request.json()
    user_message = json.dumps(data)

    # Challenge 2.a - Write prompt to evaluate the question and answer
    prompt = f"""
                        """

    # Challenge 2.b - Call the OpenAI API and get the response
    feedback_response = {}

    # Extract the generated text
    feedback_text = feedback_response.choices[0].message.content

    # Return the feedback as a JSON response
    return JSONResponse(content={"feedback": feedback_text})
