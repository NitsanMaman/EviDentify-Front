import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const goToManagerHub = () => {
    navigate('/manager-page/?uid=1');
  };

  const goToFormExample = () => {
    navigate('/admission-form?uid=1234');
  };

  return (
    <div className="home">
      <h2 className="logo">EviDentify</h2>
      <div className="button-container">
        <button className="styled-button" onClick={goToManagerHub}>Manager Hub Example</button>
        <button className="styled-button" onClick={goToFormExample}>Form Example</button>
      </div>
    </div>
  );
};

export default Home;
