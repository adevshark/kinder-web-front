import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  background-color: #f0625f;
  border: 2px solid #fff;
  border-radius: 100%;
  user-select: none;
  transform: translate(-50%, -50%);
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
  &:hover {
    z-index: 1;
  }
`;
const TransWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  border: 10px solid rgba(165,0,151, 0.5);
  border-radius: 100%;
  transform: translate(-50%, -50%);  
`;

const Marker = props => (
  <TransWrapper>
    <Wrapper
      alt={props.text}
      {...props.onClick ? { onClick: props.onClick } : {}}
    />
  </TransWrapper>
);

Marker.defaultProps = {
  onClick: null,
};

Marker.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string.isRequired,
};

export default Marker;
