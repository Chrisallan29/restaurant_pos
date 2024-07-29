import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ScrollableMenuButton = ({ children, ...props }) => {
  const buttonRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(buttonRef.current.scrollTop > 0);
    };
    buttonRef.current?.addEventListener('scroll', handleScroll);
    return () => buttonRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button ref={buttonRef} className="scrollable-button" {...props}>
      <div className="button-content" style={{ overflowY: 'auto', height: '30px' }}>
        {children}
      </div>
      {isScrolling && <div className="scroll-indicator">...</div>}
    </button>
  );
};

const StyledButton = styled.button`
  /* Style your button here */
  background-color: #f0f0f0;
  border: none;
  padding: 10px;
  cursor: pointer;
  width: 200px; /* Adjust width as needed */

  .button-content {
    height: px; /* Adjust height as needed */
    overflow-y: auto;
    display: flex; /* To ensure content is aligned horizontally */
  }

  .scroll-indicator {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 12px;
    color: #888;
  }
`;

export default ScrollableMenuButton;
