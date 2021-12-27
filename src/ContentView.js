import React, { useState } from 'react'
import { 
    View, 
    Text, 
    SafeAreaView, 
    Dimensions, 
    FlatList, 
    TouchableOpacity,
    Button,
} from 'react-native'
import { WebView } from 'react-native-webview'

const playlist = require("./assets/soundCoords.json");

const { width, height } = Dimensions.get('window');

const styles = {
    container: {
        flex: 1,
        // marginTop: 50,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center'
    },
    bottomContainer: {
        flex: 1,
        width: width,
        borderTopWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    }
};

const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor, ]}>
        <Text style={[styles.title, textColor]}>{item.id}</Text>
    </TouchableOpacity>
);

const ContentView = () => {
    let myWebV; // just for ref
    const [songIndex, setSongIndex] = useState(0);
    const [playIndex, setPlayId] = useState(0);

    const renderSongs = ({index, item}) => {
        const backgroundColor = item.id === songIndex ? "#000000" : "#ffffff";
        const color = item.id === songIndex ? "#ffffff" : "#000000";
        return (
            <Item
                item={item}
                onPress={() => setSongIndex(item.id)}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        )
    }

    const playComposition = () => {
        setPlayId(songIndex-1);
        console.log("songIdx = ", songIndex);
        console.log("playidx = ", playIndex);
        console.log("playlist = ", playlist.coordinates[songIndex]);
    }

    const RenderWebView = ({option}) => {
        if (option) {
            return (
                <WebView
                    originWhitelist={['*']}
                    ref={el => myWebV = el}
                    javaScriptEnable={true}
                    startInLoadingState={true}
                    onLoadEnd={() => myWebV.postMessage(playlist.coordinates[playIndex].url)}
                    source={{uri: "http://10.0.0.111:8081/src/bridgeSite.html"}} //change the HTML uri based on your localhost address
                    // Go to your terminal/ command prompt and execute `ipconfig` and copy-paste the iPv4 Address to the uri and locate your html accordingly
                    // source={{uri: "http://10.89.247.90:8081/src/bridgeSite.html"}}
                    // mixedContentMode={'compatibility'}
                    // onMessage={event => {
                    //     alert(event.nativeEvent);
                // }}
                />
            );
        } else {
            return (
                <WebView
                    originWhitelist={['*']}
                    ref={el => myWebV = el}
                    javaScriptEnable={true}
                    startInLoadingState={true}
                    // onLoadEnd={() => myWebV.postMessage(playlist.coordinates[playIndex].url)}
                    source={{uri: "http://10.0.0.111:8081/src/bridgeSite.html"}} //change the HTML uri based on your localhost address
                    // Go to your terminal/ command prompt and execute `ipconfig` and copy-paste the iPv4 Address to the uri and locate your html accordingly
                    // source={{uri: "http://10.89.247.90:8081/src/bridgeSite.html"}}
                    
                />
            )
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                {/* <Text>{playlist.coordinates.length}</Text> */}
                <FlatList
                    // key={"Fixed"}
                    data={playlist.coordinates}
                    renderItem={renderSongs}
                    keyExtractor={(item) => item.id}
                    extraData={songIndex}
                    numColumns={2}
                    containerStyle={{paddingBottom: 30}}
                    style={{flex: 0, flexDirection: 'row'}}
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={20}
                    initialNumToRender={playlist.coordinates.length}
                />

                <Button
                    onPress={() => playComposition()}
                    title="ADD">Add</Button>
            </View>
            <View style={styles.bottomContainer}>
                <View style={{flex: 1, width: width, height: height}}>
                    <RenderWebView option={playIndex} />
                    
                </View>
            </View>
        </SafeAreaView>
    
    );
};

export default ContentView;