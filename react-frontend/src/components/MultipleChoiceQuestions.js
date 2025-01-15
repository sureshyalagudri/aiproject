import React, { useState } from 'react';
import useApi from '../hooks/useApi';

// API functions
const fetchQuestionApi = async (topic, complexity, messages) => {
  const response = await fetch(`http://localhost:8000/mcq/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      complexity,
      messages: messages.length > 0 ? messages : null
    })
  });
  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }
  return response.json();
};

const submitAnswersApi = async (answers) => {
  const response = await fetch('http://localhost:8000/mcq/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers)
  });
  if (!response.ok) {
    throw new Error('Failed to submit answers');
  }
  return response.json();
};

const MultipleChoiceQuestions = () => {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');

  const { 
    callApi: fetchQuestion, 
    loading: loadingQuestion, 
    error: errorQuestion 
  } = useApi(fetchQuestionApi);

  const { 
    callApi: submitAnswers, 
    loading: loadingSubmit, 
    error: errorSubmit 
  } = useApi(submitAnswersApi);

  const handleFetchQuestion = async () => {
    try {
      const topic = document.getElementById('topic').value;
      const selectedComplexity = document.querySelector('input[name="complexity"]:checked').id;
      
      const data = await fetchQuestion(topic, selectedComplexity, messages);
      setMessages(data.messages);
      setCurrentQuestion(data.currentQuestion);
      setQuestionCount(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleSubmit = async () => {
    const allAnswers = [...answers, { ...currentQuestion, selectedAnswer: selectedOption }];
    try {
      const data = await submitAnswers(allAnswers);
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Multiple Choice Questions</h1>
      
      {/* Section 1: Controls */}
      <section id="section1" className="mb-4">
        {/* ...existing code for select and radio buttons... */}
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
            <div className="btn-group w-100" role="group" aria-label="Complexity">
              <input type="radio" className="btn-check" name="complexity" id="Basic" autoComplete="off" defaultChecked />
              <label className="btn btn-outline-primary w-100" htmlFor="Basic">Basic</label>

              <input type="radio" className="btn-check" name="complexity" id="Intermediate" autoComplete="off" />
              <label className="btn btn-outline-primary w-100" htmlFor="Intermediate">Intermediate</label>

              <input type="radio" className="btn-check" name="complexity" id="Advanced" autoComplete="off" />
              <label className="btn btn-outline-primary w-100" htmlFor="Advanced">Advanced</label>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <button 
              className="btn btn-primary w-100" 
              onClick={handleFetchQuestion}
              disabled={loadingQuestion}
            >
              Generate Questions
            </button>
          </div>
        </div>
      </section>

      {/* Loading and Error States */}
      {loadingQuestion && <div className="alert alert-info">Loading question...</div>}
      {errorQuestion && <div className="alert alert-danger">{errorQuestion}</div>}
      {loadingSubmit && <div className="alert alert-info">Submitting answers...</div>}
      {errorSubmit && <div className="alert alert-danger">{errorSubmit}</div>}

      {/* Question Card */}
      {currentQuestion && !loadingQuestion && (
        <div className="card">
          {/* ...existing question card code... */}
          <div className="card-header">
            <h5>Question {questionCount} of 5</h5>
          </div>
          <div className="card-body">
            <p>{currentQuestion.Question}</p>
            <div className="options">
              {currentQuestion.Options.map((option) => (
                <div className="form-check" key={option.OptionIndex}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="mcqOption"
                    id={`option${option.OptionIndex}`}
                    checked={selectedOption === option.OptionIndex}
                    onChange={() => setSelectedOption(option.OptionIndex)}
                  />
                  <label className="form-check-label" htmlFor={`option${option.OptionIndex}`}>
                    {option.OptionValue}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <div className="d-flex justify-content-between">
              <button 
                className="btn btn-secondary" 
                disabled={questionCount === 1}
              >
                Previous
              </button>
              {questionCount < 5 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setAnswers([...answers, { ...currentQuestion, selectedAnswer: selectedOption }]);
                    setSelectedOption(null);
                    handleFetchQuestion();
                  }}
                  disabled={selectedOption === null || loadingQuestion}
                >
                  Next
                </button>
              ) : (
                <button 
                  className="btn btn-success" 
                  onClick={handleSubmit}
                  disabled={selectedOption === null || loadingSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
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
  );
};

export default MultipleChoiceQuestions;