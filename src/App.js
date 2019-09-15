import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecogntion';

const app = new Clarifai.App({
    apiKey: '419d7261c8a746e0969e06e68ac0415f'
});

const particlesOptions = {
    particles: {
        number: {
            value: 50,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signin',
            signedIn: false
        }
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        console.log(width, height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    };

    displayFaceBox = (box) => {
        this.setState({box: box});
    };

    onInputChange = (event) => {
        this.setState({input: event.target.value});
    };

    onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input});
        app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
            .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
            .catch(err => console.log(err));
    };

    onRouteChange = (route) => {
        if (route === 'signin' || route === 'register') {
            this.setState({signedIn: false})
        } else if (route === 'home') {
            this.setState({signedIn: true})
        }
        this.setState({route: route})
    };

    render() {
        const { signedIn, route, box, imageUrl } = this.state;
        return (
            <div className="App">
                <Particles className='particles' params={particlesOptions}/>
                <Navigation onRouteChange={this.onRouteChange} signedIn={signedIn}/>
                {route === 'home'
                        ? <div>
                            <Logo/>
                            <Rank/>
                            <ImageLinkForm
                                onInputChange={this.onInputChange}
                                onButtonSubmit={this.onButtonSubmit}
                            />
                            <FaceRecognition box={box} imageUrl={imageUrl}/>
                           </div>
                        : route === 'signin'
                            ? <SignIn onRouteChange={this.onRouteChange}/>
                            : <Register onRouteChange={this.onRouteChange}/>
                }
            </div>
        );
    }

}

export default App;
