import React, { useState, useRef, useEffect } from 'react'
import { 
    View, 
    Text, 
    SafeAreaView, 
    Dimensions, 
    FlatList, 
    TouchableOpacity,
    Button,
    Animated
} from 'react-native'
import { WebView } from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
const { width, height } = Dimensions.get('window');
const styles = {
    container: {
        flex: 1,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
    },
    bottomContainer: {
        // flex: 0.2,
        // width: width,
        // borderTopWidth: 4,
        // alignItems: 'center',
        // justifyContent: 'center',
        hidden: true,
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    musicControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        alignItems: 'center'
    },
    playButtonContainer: {
        backgroundColor: '#FFF',
        borderColor: 'rgba(93, 63, 106, 0.2)',
        borderWidth: 16,
        width: 128,
        height: 128,
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 32,
        shadowColor: '#5D3F6A',
        shadowRadius: 30,
        shadowOpacity: 0.5,
      },
};

const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor, ]}>
        <Text style={[styles.title, textColor]}>{item.id}</Text>
    </TouchableOpacity>
);

const ContentView = () => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const songSlider = useRef(null);
    const playlist = require("./assets/soundCoords.json");
    let myWebV; // just for ref
    const [songIndex, setSongIndex] = useState(0);
    const [playIndex, setPlayId] = useState(0);
    const [isPlaying, setPlaying] = useState(false);

    useEffect(() => {
        scrollX.addListener(( { value }) => {
            const index = Math.round( value / width );
            setSongIndex(index);
        });

        return () => {
            scrollX.removeAllListeners();
        }
    }, []);

    const skipNext = () => {
        // songSlider.current.scrollToOffset({
        //     offset: (songIndex+1) * width,
        // });
        if (playIndex+1 < playlist.coordinates.length) {
            setSongIndex(playIndex+1);
            setPlayId(playIndex+1);
        } else {
            setSongIndex(0);
            setPlayId(0);
        }
        
    }

    const skipPrevs = () => {
        // songSlider.current.scrollToOffset({
        //     offset: (songIndex-1) * width,
        // });
        if (playIndex-1 >= 0) {
            setSongIndex(playIndex-1);
            setPlayId(playIndex-1);
        } else {
            setPlayId(playlist.coordinates.length-1);
            setSongIndex(playlist.coordinates.length-1);
        }
    }

    const renderSongs = ({item}) => {
        const backgroundColor = item.id === playIndex+1 ? "#000000" : "#ffffff";
        const color = item.id === playIndex+1 ? "#ffffff" : "#000000";
        return (
            <Item
                item={item}
                onPress={() => setPlayId(item.id-1)}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        )
    }

    const playComposition = () => {
        setPlayId(playIndex);
        setPlaying(!isPlaying);
        myWebV.postMessage(playlist.coordinates[playIndex].url + " " + isPlaying);
    }

    const RenderWebView = ({option}) => {
        if (option) {
            return (
                <WebView
                    originWhitelist={['*']}
                    ref={el => myWebV = el}
                    javaScriptEnable={true}
                    startInLoadingState={true}
                    onLoadEnd={() => myWebV.postMessage(playlist.coordinates[playIndex].url + " " + isPlaying)}
                    source={{uri: "http://10.0.111:8081/src/bridgeSite.html"}} //change the HTML uri based on your localhost address
                    // Go to your terminal/ command prompt and execute `ipconfig` and copy-paste the iPv4 Address to the uri and locate your html accordingly
                    // source={{uri: "http://10.89.247.90:8081/src/bridgeSite.html"}}
                    // mixedContentMode={'compatibility'}
                    // onMessage={event => {
                    //     // alert(event.nativeEvent);
                    //     let data = event.nativeEvent.data;
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
                    source={{uri: "http://10.0.111:8081/src/bridgeSite.html"}} //change the HTML uri based on your localhost address
                    // Go to your terminal/ command prompt and execute `ipconfig` and copy-paste the iPv4 Address to the uri and locate your html accordingly
                    // source={{uri: "http://10.89.247.90:8081/src/bridgeSite.html"}}
                    
                />
            )
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <FlatList
                    // key={"Fixed"}
                    data={playlist.coordinates}
                    renderItem={renderSongs}
                    keyExtractor={(item) => item.id}
                    extraData={songIndex}
                    numColumns={4}
                    containerStyle={{paddingBottom: 30}}
                    style={{flex: 0, flexDirection: 'row'}}
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={20}
                    initialNumToRender={playlist.coordinates.length}
                />
                <View style={styles.musicControls}>
                    <TouchableOpacity onPress={skipPrevs}>
                        <MaterialIcons name="skip-previous" size={35} color="#FFD369" style={{marginTop: 7}} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => playComposition()}
                        style={styles.playButtonContainer}
                    >
                        {!isPlaying ? (
                            <MaterialIcons name={"play-circle-outline"} size={65} color="#FFD369" />
                            ) : (
                            <MaterialIcons name={"pause-circle-outline"} size={65} color="#FFD369" />
                         )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={skipNext}>
                        <MaterialIcons name="skip-next" size={35} color="#FFD369" style={{marginTop: 7}} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <View style={{flex: 0.2, width: width, height: height}}>
                    <RenderWebView option={playIndex} />
                </View>
            </View>
        </SafeAreaView>
    
    );
};

export default ContentView;