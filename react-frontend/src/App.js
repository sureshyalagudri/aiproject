import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/home';
import DescriptiveQuestions from './components/DescriptiveQuestions';
import MultipleChoiceQuestions from './components/MultipleChoiceQuestions';
import FileManager from './components/FileManager';
import Search from './components/search';
import Question from './components/Question';
import Chat from './components/chat';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route path="/Question" component={Question} />
          <Route path="/descriptive-questions" component={DescriptiveQuestions} />
          <Route path="/multiple-choice-questions" component={MultipleChoiceQuestions} />
          <Route path="/file-manager" component={FileManager} />
          <Route path="/search" component={Search} />
          <Route path="/chat" component={Chat} />
          <Route path="/" exact component={Home} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;