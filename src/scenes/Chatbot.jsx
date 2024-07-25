import React, { useState } from "react";
import axios from "axios";
// Import your existing CSS file here (e.g., './styles.css')

const Chatbot = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const HTTP = "http://localhost:3000/chatbot";

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(HTTP, { prompt })
      .then((res) => {
        setResponse(res.data);
        console.log(prompt);
      })
      .catch((error) => {
        console.error(error.response.data);
      });

    setPrompt("");
  };

  const handlePrompt = (e) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="chatbot-wrapper">
      <h1>AI  Chatbot</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={handlePrompt}
          placeholder="Ask me anything..."
          rows="10"
        />
        <button type="submit">Send</button>
      </form>
      <div className="response-container">
        <p className="response-text">{response}</p>
      </div>
    </div>
  );
};

export default Chatbot;
