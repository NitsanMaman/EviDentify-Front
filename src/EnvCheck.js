import React from 'react';

const EnvCheck = () => {
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  return null;
};

export default EnvCheck;
