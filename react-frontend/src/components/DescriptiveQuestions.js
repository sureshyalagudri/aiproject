import React, { useState } from 'react';
import useApi from '../hooks/useApi';

const fetchQuestions = async (topic) => {
  const response = await fetch(`http://localhost:8000/generate-questions?topic=${topic}`);
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return response.json();
};

const submitAnswersApi = async (questions) => {
  const response = await fetch('http://localhost:8000/submitdescriptivequestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questions }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit answers');
  }
  return response.json();
};

const DescriptiveQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const { callApi: fetchQuestionsApi, loading: loadingQuestions, error: errorQuestions } = useApi(fetchQuestions);
  const { callApi: submitAnswersApiCall, loading: loadingSubmit, error: errorSubmit } = useApi(submitAnswersApi);

  const generateQuestions = async () => {
    const topic = document.getElementById('topic').value;
    try {
      const data = await fetchQuestionsApi(topic);
      setQuestions(data.questions.map(question => ({ ...question, CandidateAnswer: '' })));
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswers = async () => {
    try {
      const data = await submitAnswersApiCall(questions);
      setFeedback(data.feedback);
      console.log('Answers submitted successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].CandidateAnswer = value;
    setQuestions(newQuestions);
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
              <button className="btn btn-primary w-100" onClick={generateQuestions}>Generate Questions</button>
            </div>
          </div>
        </section>

        <section id="section2" style={{ display: questions.length > 0 ? 'block' : 'none' }}>
          {questions.map((question, index) => (
            <div className="card mb-3" key={index}>
              <div className="card-header">
                <h5>{question.Question}</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows="3"
                  value={question.CandidateAnswer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />
              </div>
            </div>
          ))}
          <button className="btn btn-success w-100" onClick={submitAnswers}>Submit Answers</button>
        </section>

        {loadingQuestions && <p>Loading...</p>}
        {errorQuestions && <p className="text-danger">{errorQuestions}</p>}
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

export default DescriptiveQuestions;