import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native'
import ContentView from './src/ContentView';

const styles = StyleSheet.create({
  // page: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "#F5FCFF"
  // },
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});

export default class App extends Component {
  render() {
    return (
      <ContentView></ContentView>
    );
  }
}

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <ContentView/>
//     </View>
//   )
// }


// export default function App() {
//   return (
//     <View style={styles.container}>
//       {/* <Text>Hello World</Text> */}
//       <ContentView/>
//     </View>
//   )
// }

// export type ToneJS = {
//   attack: (number) => {};
//   release: (number) => {};
// };

// export const useToneJS = () => {
//   const webViewRef = useRef();

//   const webView = (
//     <WebView
//       source={{ html: bridgeSite }}
//       originWhiteList={["*"]}
//       style={{
//         flex:0
//       }}
//       javaScriptEnabled={true}
//       ref={webViewRef}
//       />
//   );

//   const attack = (hz: number) => {
//     webViewRef.current.injectJavaScript(`synth.triggerAttack("${hz}");
//     `);
//   };

//   const release = (hz: number) => {
//     webViewRef.current.injectJavaScript(`
//       synth.triggerAttack("${hz}");
//     `);
//   };

//   return [{ attack, release }, webView];

// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     // alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export default App;

// constructor (props) {
//   super(props);
//   this.state = {
      
//     coordinates: [
//       [153.015, -27.5003],
//       [154.033, -28.0012],
//     ],
//   };
// }  

// componentDidMount() {
//   MapboxGL.setTelemetryEnabled(false);
//   GeoLocation.getCurrentPosition(
//     position => {
//       this.setState({
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//         error: null
//       });
//     },
//     error => this.setState({error: error.message}),
//     { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000 }
//   );
// }
// // [153.015, -27.5003], [154.033, -28.0012],
// render() {
//   return (
//     <View style={styles.container}>
//       <MapboxGL.MapView
//         ref={c => (this._map = c)}
//         zoomLevel={14}
//         centerCoordinate={this.state.coordinates[0]}
//         showUserLocation={true}
//         style={styles.container}
//         userTrackingMode={this.state.userSelectedUserTrackingMode}
//       />
//       <MapboxGL.Camera
//         zoomLevel={16}
//         centerCoordinate={this.state.coordinates[0]}
//       />
//       <MapboxGL.MarkerView coordinate={this.state.coordinates[0]}>
//         <ContentView/>
//       </MapboxGL.MarkerView>

//     </View>
//   );
// }