import React, { useState } from 'react';
import useApi from '../hooks/useApi';

const fetchQuestion = async (topic) => {
  const response = await fetch(`http://localhost:8000/ask-question?topic=${topic}`);
  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }
  return response.json();
};

const submitAnswerApi = async (question) => {
  const response = await fetch('http://localhost:8000/question-feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit answer');
  }
  return response.json();
};

const Question = () => {
  const [question, setQuestion] = useState('');
  const [feedback, setFeedback] = useState('');
  const { callApi: fetchQuestionApi, loading: loadingQuestion, error: errorQuestion } = useApi(fetchQuestion);
  const { callApi: submitAnswerApiCall, loading: loadingSubmit, error: errorSubmit } = useApi(submitAnswerApi);

  const generateQuestion = async () => {
    const topic = document.getElementById('topic').value;
    try {
      const data = await fetchQuestionApi(topic);
      setQuestion({ question: data.question, CandidateAnswer: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswer = async () => {
    try {
      const data = await submitAnswerApiCall(question);
      setFeedback(data.feedback);
      console.log('Answer submitted successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerChange = (value) => {
    setQuestion({ ...question, CandidateAnswer: value });
  };

  return (
    <div>
      <h1>Descriptive Questions</h1>
      <div className="container mt-4">
        <section id="section1" className="mb-4">
          <div className="row">
            <div className="col-md-4 mb-2">
              <select id="topic" name="topic" className="form-select" aria-label="Select Topic">
                <option value="CSharp">C#</option>
                <option value="Azure">Azure</option>
                <option value=".NET">.NET</option>
                <option value="Angular">Angular</option>
              </select>
            </div>
            <div className="col-md-4 mb-2">
              <button className="btn btn-primary w-100" onClick={generateQuestion}>Ask Question</button>
            </div>
          </div>
        </section>

        {question && (
          <section id="section2">
            <div className="card mb-3">
              <div className="card-header">
                <h5>{question.question}</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows="3"
                  value={question.CandidateAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-success w-100" onClick={submitAnswer}>Submit Answer</button>
          </section>
        )}

        {loadingQuestion && <p>Loading...</p>}
        {errorQuestion && <p className="text-danger">{errorQuestion}</p>}
        {loadingSubmit && <p>Submitting...</p>}
        {errorSubmit && <p className="text-danger">{errorSubmit}</p>}

        {feedback && (
          <section id="feedbackSection" className="mt-4">
            <h2>Feedback</h2>
            <div className="card">
              <div className="card-body">
                <pre>{feedback}</pre>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Question;