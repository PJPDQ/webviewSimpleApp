import React from 'react'
import { View, Text } from 'react-native'
import { WebView } from 'react-native-webview'

const indexHTML = require('./index.html');
const tonejs = require('./js/Tone.js');
const scriptjs = require('./js/script.js');
const styles = {
    container: {
        flex: 1,
        marginTop: 50,
    },
};

const js = `function times(a, b) {
    alert(a*b);
    return a * b;
};`

const html = `
  <html>
  <head></head>
  <body>
    <h2>Javascript alert </h2>
    <button onclick="myFunction()">TryIt</button>
    <script src="./js/Tone.js"></script>
    <script>
        function myFunction() {
            console.log("hello world!!!");
            // alert("hello world");

            let piano = new Tone.Sampler({
                urls: {
                    A1: "piano1.mp3"
                    //A2: "piano2.mp3",
                },
                baseUrl: "https://wmp.interaction.courses/audio-files/"
            }).toDestination();
            notes = ["D2", "F2", "A2", "C2", "E2", "D3", "F3", "A3"];
            for (let note in notes) {
                alert(note);
			    piano.triggerAttackRelease(note, "8n");
            }
        }
    </script>
  </body>
  </html>
`;



const ContentView = () => {
    let myWebV;
    let sound = true;
    return (
    <View style={styles.container}>
        <WebView
            originWhitelist={['*']}
            ref={el => myWebV = el}
            javaScriptEnable={true}
            source={{uri: "http://10.0.0.111:8081/src/bridgeSite.html"}} //change the HTML uri based on your localhost address
            // Go to your terminal/ command prompt and execute `ipconfig` and copy-paste the iPv4 Address to the uri and locate your html accordingly
            // source={{uri: "http://10.89.247.90:8081/src/bridgeSite.html"}}
            injectedJavaScript={js}
            mixedContentMode={'compatibility'}
            onMessage={event => {
                alert(event.nativeEvent);
            }}
        />
        {/* <Text>Hello world!</Text> */}
    </View>
    );
};

export default ContentView;