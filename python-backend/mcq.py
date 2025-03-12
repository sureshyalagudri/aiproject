from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from openai import OpenAI
from util import generateToken
import json
from pydantic import BaseModel, Field
from typing import List, Optional
import os

router = APIRouter()
header_name = os.getenv('GATEWAY_HEADER_NAME')
header_value = os.getenv('GATEWAY_HEADER_VALUE')
headers = {
    header_name: header_value
 }
client = OpenAI(default_headers=headers)

class Option(BaseModel):
    OptionIndex: int
    OptionValue: str

class QuestionModel(BaseModel):
    Id: str
    Question: str
    Options: List[Option]
    CorrectOptionIndex: int
    Complexity: str

class GenerateQuestionRequest(BaseModel):
    topic: str
    complexity: str  # Add complexity field
    messages: Optional[List[dict]] = None


@router.post("/mcq/generate")
async def generate_mcq(request: GenerateQuestionRequest):
    if not request.messages:
        messages = [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "You are a technical interviewer creating technical multiple-choice questions. Generate one question with a specified complexity level (Basic, Intermediate, or Advanced)",
                    }
                ],
            }
        ]
    else:
        messages = request.messages

    # Use the provided complexity level
    prompt = f"Create {request.topic} Multiple choice interview question with complexity level: {request.complexity}."
    user_message = {"role": "user", "content": [{"type": "text", "text": prompt}]}
    messages.append(user_message)


    question_schema = {
    "type": "object",
    "properties": {
        "Id": {
            "type": "string",
            "description": "The unique identifier for the question."
        },
        "Question": {
            "type": "string",
            "description": "The text of the multiple-choice question."
        },
        "Options": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "OptionIndex": {
                        "type": "integer",
                        "description": "The index of the option."
                    },
                    "OptionValue": {
                        "type": "string",
                        "description": "The text of the option."
                    }
                },
                "required": ["OptionIndex", "OptionValue"],
                "additionalProperties": False
            }
        },
        "CorrectOptionIndex": {
            "type": "integer",
            "description": "The index of the correct option."
        },
        "Complexity": {
            "type": "string",
            "description": "The complexity level of the question."
        }
    },
    "required": ["Id", "Question", "Options", "CorrectOptionIndex", "Complexity"],
    "additionalProperties": False
    }

# Change the call to client.beta.chat.completions.parse for Pydantic classes.
    response = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        temperature=0.5,
        response_format=QuestionModel,
        messages=messages,
    )

# Don't change below lines if Pydantic is used.
    questions_text = response.choices[0].message.content
    questions = json.loads(questions_text)
    assistant_message = {
        "role": "assistant",
        "content": [{"type": "text", "text": questions_text}],
    }
    messages.append(assistant_message)

    return JSONResponse(content={"messages": messages, "currentQuestion": questions})


@router.post("/mcq/submit")
async def submit_mcq(request: Request):
    data = await request.json()
    user_message = json.dumps(data)

    prompt = f"""Evaluate the following candidate's answers to multiple-choice questions and provide: \n\n \
        * An overall rating out of 10. \n
        * Specific feedback on each answer, highlighting strengths and weaknesses \n \
      JSON Data:    
    {user_message}"""

    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "You are an expert in evaluating multiple-choice questions. Provide feedback for each answer.",
                    }
                ],
            },
            {"role": "user", "content": [{"type": "text", "text": prompt}]},
        ],
    )

    feedback_text = response.choices[0].message.content

    return JSONResponse(content={"feedback": feedback_text})
