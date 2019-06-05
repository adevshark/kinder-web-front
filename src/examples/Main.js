import React, { Component, Fragment } from 'react';
import isEmpty from 'lodash.isempty';
import { Flex, Box } from '@rebass/grid';
import { Text } from 'rebass';
import { ClipLoader } from 'react-spinners';
import TimerMixin from 'react-timer-mixin';
import { geolocated } from 'react-geolocated';
import Geocode from 'react-geocode';
import randomstring from 'randomstring';
import styled from 'styled-components';

// components:
import Marker from '../components/Marker';
import GoogleMap from '../components/GoogleMap';
import LOS_ANGELES_CENTER from '../const/la_center';
import Fire from '../services/fire';
import KGradientButton from '../components/KGradientButton';

[TimerMixin];

// Return map bounds based on list of places
const getMapBounds = (map, maps, places) => {
  const bounds = new maps.LatLngBounds();

  places.forEach((place) => {
    bounds.extend(new maps.LatLng(
      place.latitude,
      place.longitude,
    ));
  });
  return bounds;
};

// Re-center map when resizing the window
const bindResizeListener = (map, maps, bounds) => {
  maps.event.addDomListenerOnce(map, 'idle', () => {
    maps.event.addDomListener(window, 'resize', () => {
      map.fitBounds(bounds);
    });
  });
};

const Overlay = styled.div`
  position: fixed; 
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0; 
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5); /* Black background with opacity */
  z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
  cursor: pointer; /* Add a pointer on hover */
  margin: auto;
`;

const CenterBox = styled.div`
  text-align:center;
  height: 170px;/*height needs to be set*/
  width: 550px;
  margin: auto;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const HelpTitle = styled.h1`
`;

const CommonDesc = styled.p`
  color: #777777;
`;

const GuardianTitle = styled.h1`
  font-size: 30px;
`;

const AreaTitle = styled.h2`
  font-size: 20px;
`;

const Input = styled.input`
  height        : calc(0.3rem * 6);
  outline       : none;
  border-radius : 0;
  padding       : 0;
  appearance    : none;
  border        : none;
  border-bottom : 1px solid #C5D2E0;
  transition    : border 0.1s;
  font-size     : inherit;
  padding       : 5px;
  width: 100%;
`;

const DiscountTitle = styled.h1`
  font-size: 32px;
`;
const DiscountDesc = styled.p`
  color: #777777;
  line-height: 28px;
`;

const defaultPath = process.env.REACT_APP_BASE_PATH;

class Main extends Component {
  constructor(props) {
    super(props);

    const userId = randomstring.generate();

    const date = new Date();

    this.currDate = date;

    this.status = 0; // 0 means initial, 1 means sent find bandId

    this.state = {
      places: [],
      loading: true,
      userId,
      parentProfile: {
        mobileNumber: '+47 123 45 678',
        fullName: 'Daniel',
      },
      mineCoords: {},
      targetCoords: {
        latitude: 36.205,
        longitude: 138.251924,
      },
      mineAddress: '',
      targetAddress: '',
      showDiscount: false
    };
  }

  getUser() {
    return {
      name: this.state.userId,
      _id: Fire.shared.uid,
    };
  }


  componentDidMount() {
    const bandId = localStorage.getItem('bandId');
    const phoneNumber = localStorage.getItem('phoneNumber');

    /*
    fetch('places.json')
      .then(response => response.json())
      .then(data => this.setState({ places: data.results }));
    */

    Fire.shared.on((message) => {
      console.log(message);
      if (this.currDate >= message.timestamp) {
        return;
      }
      this.processMessage(message);
    });

    // Set API Key
    Geocode.setApiKey(process.env.REACT_APP_MAP_KEY);

    this.interval = setInterval(() => {
      this.sendMessage(JSON.stringify({
        cmd: 'find',
        data: {
          bandId,
          phoneNumber,
        },
      }));
    }, 10000);
  }

  componentWillUnmount() {
    console.log('Dismount');
    clearInterval(this.interval);
    clearInterval(this.locationInterval);
  }

  refreshGeocoding() {
    console.log("refresh geocoding was called");
    console.log(this.props.isGeolocationAvailable);
    console.log(this.props.isGeolocationEnabled);
    console.log(this.props.coords);

    if (this.props.isGeolocationAvailable && this.props.isGeolocationEnabled && this.props.coords) {
      // self position
      this.setState({
        mineCoords: {
          latitude: this.props.coords.latitude,
          longitude: this.props.coords.longitude,
        },
      });
/*
      this.setState({
        targetCoords: {
          latitude: this.props.coords.latitude + 0.01,
          longitude: this.props.coords.longitude - 0.01,
        },
      });
*/
      this.setState({
        places: [this.state.mineCoords, this.state.targetCoords]
      });

      this.apiIsLoaded(undefined, undefined, this.state.places);
      
      // update
      /*
      Geocode.fromLatLng(this.state.mineCoords.latitude, this.state.mineCoords.longitude).then(
        (response) => {
          this.setState({
            mineAddress: response.results[0].formatted_address,
          });
        },
        (error) => {
          console.error(error);
        },
      );
      */
  
      // update target address
      Geocode.fromLatLng(this.state.targetCoords.latitude, this.state.targetCoords.longitude).then(
        (response) => {
          this.setState({
            targetAddress: response.results[0].formatted_address,
          });
        },
        (error) => {
          console.error(error);
        },
      );
      
    }
  }

  /**
   * send message function
   *
   * @param {string} text
   */
  sendMessage(text) {
    Fire.shared.send([{ text, user: this.getUser() }]);
  }

  /**
   * process message from firebase
   *
   * @param {string} message
   */
  processMessage(message) {
    const bandId = localStorage.getItem('bandId');

    const msgText = message.text;
    const msgObj = JSON.parse(msgText);

    if (msgObj.cmd === 'agree') {
      console.log(msgObj.data);
      if (msgObj.data.bandId != bandId) { // skip other's band id
        return;
      }
      clearInterval(this.interval);

      this.locationInterval = setInterval(() => {
        // this.refreshGeocoding();
        this.sendPosition();
      }, 10000); // every 10 seconds , send pos

      // store gaurdian id
      this.remoteUserId = message.user._id;

      this.setState({
        loading: false,
        parentProfile: msgObj.data.profile,
      });
    } else if (msgObj.cmd === 'disagree') {
      if (msgObj.data.bandId != bandId) { // skip other's band id
        return;
      }
      clearInterval(this.interval);
      this.props.history.push(`${defaultPath}`);
    } else if (msgObj.cmd === 'pos') {
      if (this.remoteUserId == message.user._id) {
        this.setState({
          targetCoords: {
            latitude: msgObj.data.pos.latitude + 0.01,
            longitude: msgObj.data.pos.longitude - 0.01,
          },
        });
        this.refreshGeocoding();
      } else {
        console.log('trash');
        console.log(this.remoteUserId);
      }
    } else if (msgObj.cmd === 'return') {
      if (this.remoteUserId == message.user._id) {
        this.setState({
          showDiscount: true
        });
      }
    }
  }

  /**
   * send current web position
   */
  sendPosition() {
    if (this.props.isGeolocationAvailable && this.props.isGeolocationEnabled && this.props.coords) {
      this.sendMessage(JSON.stringify({
        cmd: 'pos',
        data: {
          pos: {
            latitude: this.props.coords.latitude,
            longitude: this.props.coords.longitude
          }
        },
      }));
    } else {
      console.log('can not find the pos');
    }
  }


  // Fit map to its bounds after the api is loaded
  apiIsLoaded(map, maps, places) {
    if (map) {
      this.map = map;
    }
    if (maps) {
      this.maps = maps;
    }

    if (!this.map || !this.maps) {
      return;
    }

    // Get bounds by our places
    const bounds = getMapBounds(this.map, this.maps, places);
    // Fit map to bounds
    this.map.fitBounds(bounds);
    // Bind the resize listener
    bindResizeListener(this.map, this.maps, bounds);
  };

  gotoDiscount() {
    this.props.history.push(`${defaultPath}`);
  }

  render() {
    const { places } = this.state;

    if (this.state.showDiscount) {
      return (
        <Flex flexWrap="wrap" flexDirection='column' css={{textAlign: 'center'}}>
          <Box width={1} mt={5}>
            <DiscountTitle>Thanks for helping!</DiscountTitle>
          </Box>
          <Box width={2/3} mt={5} m="auto">
            <DiscountDesc>We would like to thank you by offering a 20% discount on KinderID so you can use our services for your own children. Please enter your email address to receive your discount.</DiscountDesc>
          </Box>
          <Box width={[1/2, 1/2, 1/4]} mt={5} mx="auto">
            <Input type="email" placeholder="Email" />
          </Box>
          <Box width={[1/2, 1/4, 1/8]} mt={5} mx="auto">
            <KGradientButton onClick={() => this.gotoDiscount()}>Get discount</KGradientButton>
          </Box>
        </Flex>
      );
    }

    if (this.state.loading) {
      return (
        <Overlay>
          <CenterBox>
            <ClipLoader
              sizeUnit="px"
              size={150}
              color="#123abc"
              loading={this.state.loading}
            />
            <div>Connecting to parent...</div>
          </CenterBox>
        </Overlay>
      );
    }
    return (
      <Fragment>
        <Flex flexWrap="wrap" css={{ textAlign: 'center', height: '100%', margin: 0 }}>
          <Box width={1 / 2} py={5} px={3} css={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box mt={5}>
              <h1>You're now helping {this.state.parentProfile.fullName}</h1>
              <CommonDesc>Please contact guardian to arrange a meeting.</CommonDesc>
            </Box>
            <Box css={{ textAlign: 'center' }}>
              <CommonDesc>Guardians name</CommonDesc>
              <GuardianTitle>{this.state.parentProfile.fullName}</GuardianTitle>
              <Box width={1 / 3} mx="auto">
                <KGradientButton>{this.state.parentProfile.mobileNumber}</KGradientButton>
              </Box>
            </Box>
            <Box>
              <CommonDesc>Guardian's current location</CommonDesc>
              <AreaTitle>{this.state.targetAddress}</AreaTitle>
            </Box>
          </Box>
          <Box width={1 / 2}>
            {(
              <GoogleMap
                defaultZoom={10}
                defaultCenter={LOS_ANGELES_CENTER}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => this.apiIsLoaded(map, maps, places)}
              >
                {places.map(place => (
                  <Marker
                    text="test"
                    lat={place.latitude}
                    lng={place.longitude}
                  />
                ))}
              </GoogleMap>
            )}
          </Box>
        </Flex>
      </Fragment>
    );
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
  watchPosition: true,
})(Main);
