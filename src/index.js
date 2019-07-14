import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import HTTP from './http-common';

class Trains extends React.Component {
  getDestination(destination) {
    return destination ? destination.split('Underground Station')[0] : 'Check front of train';
  }

  getTimeToStation(secondsToArrival) {
    const mins = Math.floor(secondsToArrival / 60);
    return mins > 0 ? `${mins} min` : 'due';
  }

  render() {
    return (
      <div>
        {this.props.trains.map((train, index) =>
          <article >
            <p key={index}>
              {this.getDestination(train.destinationName)} - {this.getTimeToStation(train.timeToStation)}
            </p>
          </article>
        )}
      </div>
    );
  }
}

const Arrivals = (props) => {
  return (
    <div>
      {props.stationArrivals.map((platformArrivals, index) =>
        <article className="platform" >
          <h2 key={index}>{platformArrivals.platformNumber}</h2>
          <Trains trains= {platformArrivals.trains}/>
        </article>
      )}
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stationName: '',
      stationArrivals: [],
    };
  }

  componentDidMount() {
    HTTP.get()
      .then(response => {
        const stationName = response.data[0].stationName.split('Underground Station')[0];

        const platforms = response.data.map(train => train.platformName);
        const uniquePlatforms = [...new Set(platforms)];
        const sortedPlatforms = uniquePlatforms.sort((p1, p2) => p1[p1.length - 1] - p2[p2.length - 1]);

        sortedPlatforms.forEach((platform, index) => {
          const platformArrivals = { id: index, platformNumber: platform, trains: [] };

          response.data.forEach(train => {
              if (train.platformName === platform) {
                  platformArrivals.trains.push(train);
              }
          });

          platformArrivals.trains = platformArrivals.trains.sort((train1, train2) => train1.timeToStation - train2.timeToStation);
          const stationArrivals = this.state.stationArrivals;
          stationArrivals.push(platformArrivals);

          this.setState({
              stationName: stationName,
              stationArrivals: stationArrivals
          });
        });
      }).catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="app">
        <div className="container">
          <header>
            <img src="./london-underground.png" alt="The London Underground Logo"></img>
            <h1>{this.state.stationName}</h1>
          </header>

          <main>
            <Arrivals stationArrivals={this.state.stationArrivals} />
          </main>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
