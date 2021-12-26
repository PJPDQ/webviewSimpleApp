import React from 'react'
import { View, Text } from 'react-native'
import { WebView } from 'react-native-webview'

const styles = {
    container: {
        flex: 1,
        marginTop: 50,
    },
};

const ContentView = () => {
    let myWebV; // just for ref
    return (
    <View style={styles.container}>
        <WebView
            originWhitelist={['*']}
            ref={el => myWebV = el}
            javaScriptEnable={true}
            source={{uri: "http://10.0.0.111:8081/src/bridgeSite.html"}} //change the HTML uri based on your localhost address
            // Go to your terminal/ command prompt and execute `ipconfig` and copy-paste the iPv4 Address to the uri and locate your html accordingly
            // source={{uri: "http://10.89.247.90:8081/src/bridgeSite.html"}}
            mixedContentMode={'compatibility'}
            onMessage={event => {
                alert(event.nativeEvent);
            }}
        />
    </View>
    );
};

export default ContentView;