import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chatbot.css';
import axios from 'axios';

const Chatbot = () => {
  const [user, setUser] = useState(null);
  //const [bmiData, setBmiData] = useState([]);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(true); // Default to open

  const chatbotRef = useRef(null);
  //
  useEffect(() => {
          const token = localStorage.getItem('token');
          if (token) {
              axios.get('http://localhost:5000/api/dashboard', {
                  headers: { Authorization: `Bearer ${token}` }
              })
        
              .then(res => {
                  const userData = res.data.user;  
                  setUser(res.data.user);
                  if (userData.name) setName(userData.name);
                  if (userData.gender) setGender(userData.gender);
                  if (userData.birth) {
                    const calculatedAge = calculateAge(userData.birth);
                    setAge(calculatedAge);
                  }
                  if (userData.bmiEntries && userData.bmiEntries.length > 0) {
                    // Sort entries by date descending
                    const sorted = userData.bmiEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const lastEntry = sorted[0];
                    if (lastEntry.weight) {
                      setWeight(lastEntry.weight.toString()); // populate form input
                      setHeight(lastEntry.height.toString()); 
                    }
                  }

                  //setName(res.data.user.name);
                  // If BMI entries exist in user object
                  
              })
              .catch(err => console.log('Error fetching dashboard data:', err));
          }
      }, []);
  //age calculation
  const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    const today = new Date();
  
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
  
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  
    return age;
  };    


  //
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5001/api/chatbot', {
      
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, gender, age, height, weight, question }),
      });

      const data = await res.json();
      setResponse(formatResponse(data.response));
      setShowInput(false); // Hide input section after submitting
    } catch (error) {
      console.error('Error:', error);
      setResponse('There was frontan error processing your request.');
    }
  };

  const formatResponse = (response) => {
    return `<h2>AI Response:</h2><p>${response}</p>`;
  };

  const handleNextQuestion = () => {
    setShowInput(true);
    setQuestion('');
    setResponse('');
  };

  const handlePositiveChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^[+]?\d+(\.\d+)?$/.test(value)) {
      setter(value);
    }
  };

  // Close chatbot if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsChatbotOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCloseChatbot = () => {
    setIsChatbotOpen(false);
  };

  return (
    <div>
      {/* Chatbot container */}
      <div
        className={`chatbot-container ${isChatbotOpen ? 'active' : ''}`}
        ref={chatbotRef}
      >
        {user ? (
        <div className="chat-input">
          
          {showInput ? (
            <form onSubmit={handleSubmit}>

              
              
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything"
                required
              />
              <div className="button-container">
                <button type="submit">Send</button>
                <button type="button" onClick={handleCloseChatbot}>Close</button>
              </div>
            </form>
          ) : (
            <div className="chat-response">
              <div dangerouslySetInnerHTML={{ __html: response }}></div>
              <button onClick={handleNextQuestion}>Next Question</button>
            </div>
          )}
          </div>
          ) : (
          <div className="chat-input">
          
            {showInput ? (
              <form onSubmit={handleSubmit}>
                < input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                
                <input
                  type="number"
                  value={age}
                  onChange={handlePositiveChange(setAge)}
                  placeholder="Enter your age"
                  required
                />
                <input
                  type="number"
                  value={height}
                  onChange={handlePositiveChange(setHeight)}
                  placeholder="Enter your height in cm"
                  required
                />
                <input
                  type="number"
                  value={weight}
                  onChange={handlePositiveChange(setWeight)}
                  placeholder="Enter your weight in kg"
                  required
                />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask me anything"
                  required
                />
                <div className="button-container">
                  <button type="submit">Send</button>
                  <button type="button" onClick={handleCloseChatbot}>Close</button>
                </div>
              </form>
            ) : (
              <div className="chat-response">
                <div dangerouslySetInnerHTML={{ __html: response }}></div>
                <button onClick={handleNextQuestion}>Next Question</button>
              </div>
            )}
            </div>
          )}
        
      </div>

      {/* Button to open chatbot when closed */}
      {!isChatbotOpen && (
        <div className="chatbot-toggle-btn" onClick={() => setIsChatbotOpen(true)}>
          <span>💬</span>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
