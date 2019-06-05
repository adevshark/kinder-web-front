import React from 'react';
import { Flex, Box, Footer } from '@rebass/grid';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import KGradientButton from './components/KGradientButton';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #fefefe;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  width: 500px;
  padding: 15px;
  border: 1px solid #d8d8d8;
  list-style: none;
  text-align: left;
`;

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #7f7f7f;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledLink = styled(Link)`
  width: 100%;
  padding: 15px 15px 15px 0;
  color: #000000;
  text-decoration: none;
  text-align: center;
`;

const Input = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  border: 1px solid gray;
  border-radius: 3px;
`;

const Button = styled.button`
  display: inline-block;
  color: palevioletred;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
`;

const Wristband = styled.input`
  margin-left   : 2.44em;
  height        : calc(0.3rem * 6);
  outline       : none;
  border-radius : 0;
  padding       : 0;
  appearance    : none;
  border        : none;
  border-bottom : 1px solid #C5D2E0;
  transition    : border 0.1s;
  font-size     : inherit;
`;

const HomeTitle = styled.h1`
  font-size: 34px;
`;
const HomeDesc = styled.p`
  color: #808080;
`;
const FooterTitle = styled.h1`
  font-size: 20px;
  color: #999999;
`;
const FooterDesc = styled.p`
  font-size: 10px;
  color: #a0a0a0;
`;


const defaultPath = process.env.REACT_APP_BASE_PATH;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bandId: '',
      phoneNumber: ''
    };
  }

  searchWristbandId() {
    const { bandId, phoneNumber } = this.state;

    if (!bandId) {
      alert("Input Wristband ID");
      return;
    }
    if (!phoneNumber) {
      alert("Input phone number");
      return;
    }
    localStorage.setItem('bandId', bandId);
    localStorage.setItem('phoneNumber', phoneNumber);
    this.props.history.push(`${defaultPath}default`);
  }

  render() {
    return (
      <Flex flexDirection='column' css={{textAlign: 'center'}}>
        <Box p={5} width={1} mx="auto">
          <HomeTitle>Have you found a child?</HomeTitle>
          <HomeDesc>Please enter the ID from the child’s wristband and you mobile number. Your mobile number will be sent to the child’s guardian’s.</HomeDesc>
        </Box>
        <Box p={3} width={1/3} mx="auto">
          <InputArea>
            <Wristband
              type="text"
              value={this.state.bandId}
              placeholder="Wristband ID"
              onChange={e => this.setState({ bandId: e.target.value })}
            />
            <br />
            <br />
            <Box width={1}>
            <PhoneInput
              placeholder="Enter phone number"
              value={this.state.phoneNumber}
              onChange={phone => this.setState({ phoneNumber: phone })} />
            </Box>
              <br />
              <br />
            <Box width={1/2} mx="auto">
              <KGradientButton onClick={() => this.searchWristbandId()}>Connect</KGradientButton>
            </Box>
          </InputArea>
        </Box>
        <Box p={5} width={1} mx="auto">
          <FooterTitle>Privacy Policy</FooterTitle>
          <FooterDesc>
To enable contact, we need to process and share your phone number and location with the child's parents/guardian. Your personal data will only be shared during the active session. Safety Innovation AS is responsible for your personal data. The legal basis for our processing of your personal data is the parents'/Guardian's and the child's legitimate interest in being reunited, and our legitimate interest in offering the functionality in KinderID. To find out more click HERE</FooterDesc>
        </Box>
      </Flex>
    );
  }
}

export default Home;
