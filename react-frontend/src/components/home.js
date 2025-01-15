import React, { useState } from 'react';

const Home = () => {
  return (
    <div className="container mt-4">
      <h1>Welcome to the Online Quiz App</h1>
      <p>
        The Online Quiz App is your ultimate destination for testing and enhancing your knowledge across various subjects. Whether you're preparing for an exam, looking to challenge yourself, or simply want to learn something new, our app provides a wide range of questions and answers to suit your needs.
      </p>
      <p>
        Features of the Online Quiz App include:
      </p>
      <ul>
        <li>Automatically generated questions and answers on diverse topics.</li>
        <li>Multiple-choice questions to test your quick thinking.</li>
        <li>Descriptive questions to deepen your understanding.</li>
        <li>RAG on Uploaded data</li>
        <li>User-friendly interface for a seamless experience.</li>
      </ul>
      <p>
        Navigate through the app using the menu to start your quiz journey. Happy learning!
      </p>
    </div>
  );
};

export default Home;