// Setup App

function initApp() {

	// Setup Initial Variables
	
	let appData = {
		compositions: {},
		samples_to_compositions: {},
		samples: {}
	}
	
	let locationCurrent = { // Defaulting to GP South, UQ
		lat: -27.499808767797283,
		lng: 153.0149438530018
	};
	
	let sampleRecordingStatus = false;
	let sampleRecordingDuration = config().sampleRecordingDuration;
	let sampleRecordingInterval = config().sampleRecordingInterval;
	let sampleRecordingProgress = 0;
	let sampleRecordingTimeout;
	let sampleRecordingData = "";
	
	let samplePlaybackStatus = false;
	let samplePlaybackProgress = 0;
	let samplePlaybackTimeout;
	
	// App Configuration
	
	function config() {
		return {
			defaultHash: "music-map",
			compositionPlaybackDuration: 30 * 1000, // 30 seconds
			sampleRecordingDuration: 5 * 1000, // 5 seconds
			sampleRecordingInterval: 10 // 10 milliseconds
		};
	}
	
	// Setup URL Routing
	
	function getHashFull() {
		if(typeof window.location.hash.split("#")[1] != "undefined") {
			return window.location.hash.split("#")[1];
		}
		else {
			return config().defaultHash;
		}
	}
	
	function getHashParts() {
		return getHashFull().split("/");
	}
	
	function initHash() {
		
		let hashParts = getHashParts();
		
		// Root # Affects Tab Bar Only
		
		const tabBarItems = document.querySelectorAll("#tab-bar > a");
		for(let tabBarItem of tabBarItems) {
			tabBarItem.classList.remove("active");
			if(tabBarItem.getAttribute("href") == "#" + hashParts[0]) {
				tabBarItem.classList.add("active");
			}
		}
		
		// Root # Affects Parent Content Items Only
		
		const parentContentItems = document.querySelectorAll("#content > section");
		for(let parentContentItem of parentContentItems) {
			
			parentContentItem.classList.remove("active");
			
			if(parentContentItem.id == hashParts[0]) {
				parentContentItem.classList.add("active");
				
				// Sub # Affects Sub Content Items Only
				
				const subContentItems = parentContentItem.children;
				for(let subContentItem of subContentItems) {
					
					subContentItem.classList.remove("active");
					
					if(typeof hashParts[1] == "undefined") {
						parentContentItem.firstElementChild.classList.add("active");
					}
					else if(subContentItem.id == hashParts[0] + "-" + hashParts[1]) {
						subContentItem.classList.add("active");
					}
					
				}
				
			}
	
		}
		
	}
	
	// API Communication
	
	async function getFromAPI(url = "") {
		url = "https://wmp.interaction.courses/api/?mode=read" + url;
		const response = await fetch(url, {
			method: "GET",
		});
		console.log(response);
		const data = await response.json();
		return data;
	}
		
	async function postToAPI(url = "", input = {}) {
		url = "https://wmp.interaction.courses/api/?mode=create" + url;
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(input)
		});
		console.log(response);
		const data = await response.json();
		return data;
	}
	
	async function getData(endpoint, storeOnce = false) {
		if(Object.keys(appData[endpoint]).length === 0 || !storeOnce) {
			const data = await getFromAPI("&endpoint=" + endpoint + "&limit=100");
			appData[endpoint] = data[endpoint];
		}
		else {
			console.log("`appData." + endpoint + "` already defined");
		}
		return appData[endpoint];
	}
	
	// Setup Instruments
	
	function initInstrumentSounds() {
		
		// Setup Instruments with Tone.js
		
		let instrumentSounds = {
			"piano": [],
			"drums": [],
			"microphone": [],
			"theremin": []
		};
		for(let instrument of Object.keys(instrumentSounds)) {
			if(instrument == "piano") {
				instrumentSounds[instrument] = new Tone.Sampler({
					urls: {
						A1: "piano1.mp3"
						//A2: "piano2.mp3",
					},
					baseUrl: "https://wmp.interaction.courses/audio-files/"
				}).toDestination();
			}
			else if(instrument == "drums") {
				for(let count = 1; count <= 8; count++) {
					instrumentSounds[instrument].push(
						new Tone.Player("https://wmp.interaction.courses/audio-files/" + instrument + count + ".mp3").toDestination()
					);
				}
			}
			else if(instrument == "microphone") {
				instrumentSounds[instrument] = new Tone.Player().toDestination();
			}
			else {
				instrumentSounds[instrument] = new Tone.Synth({
					oscillator: {
						type: "amtriangle",
						harmonicity: 0.5,
						modulationType: "sine"
					},
					envelope: {
						attackCurve: "exponential",
						attack: 0.05,
						decay: 0.2,
						sustain: 0.2,
						release: 1.5,
					},
					portamento: 0.05
				}).toDestination();
			}
		}
		
		return instrumentSounds;
	
	}
	
	function instrumentSoundPlay(instrumentSounds, instrument, index = 0) {
		
		if(instrument == "piano") {
			notes = ["D2", "F2", "A2", "C2", "E2", "D3", "F3", "A3"];
			instrumentSounds[instrument].triggerAttackRelease(notes[index], "8n");
		}
		else if(instrument == "drums") {
			instrumentSounds[instrument][index].start();
		}
		else if(instrument == "microphone") {
			instrumentSounds[instrument].start();
		}
		else {
			instrumentSounds[instrument].triggerAttackRelease(index, "8n");
		}
		
		console.log("Played Instrument `" + instrument + "` with Index #" + index);
		
	}
	
	// Setup Sampler with Record/Playback Functions
	
	function initSampler(instrumentSounds) {
	
		// Setup Initial Variables
		
		/*const microphone = navigator.mediaDevices.getUserMedia({ audio: true, video: false });
		let mediaRecorder;
		let recordedBlob = [];
		microphone.then(function(stream) {
			mediaRecorder = new MediaRecorder(stream, {
				mimeType: "audio/webm"
			});
			mediaRecorder.addEventListener("dataavailable", function(event) {
				if(event.data.size > 0) {
					recordedBlob.push(event.data);
					console.log(recordedBlob);
				}
			});
			mediaRecorder.addEventListener("stop", function(event) {
				console.log(URL.createObjectURL(new Blob(recordedBlob)));
			});
		});*/			
		
		const samplerSaveButtons = document.querySelectorAll(".sampler-save-button");
		const samplerRecordingButtons = document.querySelectorAll(".sampler-recording-button");
		const samplerPlaybackButtons = document.querySelectorAll(".sampler-playback-button");
		const samplerKeyButtonsAll = document.querySelectorAll(".sampler-key-buttons");
		
		// Choose Selected Sampler Based on URL Routing
		
		function samplerSelected() {
			return getHashParts()[1]; // 2nd Part of Hash ("piano", "drums" etc)
		}
		
		function samplerRecord() {
			if(sampleRecordingStatus && sampleRecordingProgress <= sampleRecordingDuration) {
				console.log("Recording... " + sampleRecordingProgress);
				sampleRecordingProgress = sampleRecordingProgress + sampleRecordingInterval;
				sampleRecordingTimeout = setTimeout(samplerRecord, sampleRecordingInterval);
			}
			else {
				console.log("Ended Recording Automatically");
				samplerChangeRecordStatus();
			}
		}
		
		function samplerChangeRecordStart() {
			sampleRecordingStatus = true;
			sampleRecordingData = "";
			for(let samplerRecordingButton of samplerRecordingButtons) {
				samplerRecordingButton.innerHTML = "Stop Recording";
			}
			for(let samplerSaveButton of samplerSaveButtons) {
				samplerSaveButton.innerHTML = "Save";
				samplerSaveButton.removeAttribute("disabled");
			}
			samplerRecord();	
		}
		
		function samplerChangeRecordStop() {
			clearTimeout(sampleRecordingTimeout);
			sampleRecordingStatus = false;
			sampleRecordingProgress = 0;
			for(let samplerRecordingButton of samplerRecordingButtons) {
				samplerRecordingButton.innerHTML = "Start Recording";
			}
			for(let samplerSaveButton of samplerSaveButtons) {
				samplerSaveButton.style.display = "inline-block";
			}
		}
		
		function samplerChangeRecordStatus() {
			const samplerRecordingButtons = document.querySelectorAll(".sampler-recording-button");
			if(samplerSelected() == "microphone" && typeof mediaRecorder != "undefined") {	
				if(sampleRecordingStatus) {
					samplerChangeRecordStop();
					mediaRecorder.stop();
					console.log(mediaRecorder.state);
				}
				else {
					samplerChangeRecordStart();
					mediaRecorder.start();
					console.log(mediaRecorder.state);
				}
				
			}
			else {
				if(sampleRecordingStatus) {
					samplerChangeRecordStop();
				}
				else {
					samplerChangeRecordStart();
				}
			}
		}
		
		function samplerPlayback() {
			let sampler = samplerSelected();
			if(sampler == "piano" || sampler == "drums" || sampler == "theremin") {
				if(samplePlaybackStatus && samplePlaybackProgress <= sampleRecordingDuration) {
					console.log("Playing Back... " + samplePlaybackProgress);
					sampleRecordingDataChunks = sampleRecordingData.split("|");
					for(let chunk of sampleRecordingDataChunks) {
						chunk = chunk.split(":");
						if(chunk[0] == samplePlaybackProgress) {
							instrumentSoundPlay(instrumentSounds, sampler, chunk[1]);
						}
					}
					samplePlaybackProgress = samplePlaybackProgress + sampleRecordingInterval;
					samplePlaybackTimeout = setTimeout(samplerPlayback, sampleRecordingInterval);
				}
				else {
					console.log("Ended Playback Automatically");
					samplerChangePlayStatus();
				}
			}
		}
		
		function samplerChangePlayStatus() {
			if(sampleRecordingData != "") {
				const samplerPlaybackButtons = document.querySelectorAll(".sampler-playback-button");
				if(samplePlaybackStatus) {
					console.log("Change Status: End");
					clearTimeout(samplePlaybackTimeout);
					samplePlaybackStatus = false;
					samplePlaybackProgress = 0;
					for(let samplerPlaybackButton of samplerPlaybackButtons) {
						samplerPlaybackButton.innerHTML = "Start Playback";
					}
				}
				else {
					console.log("Change Status: End");
					samplePlaybackStatus = true;
					for(let samplerPlaybackButton of samplerPlaybackButtons) {
						samplerPlaybackButton.innerHTML = "Stop Playback";
					}
					samplerPlayback();
				}
			}
			else {
				console.log("Nothing's Been Recorded Yet to Play");
			}
		}
		
		function samplerSave() {
			let sampler = samplerSelected();
			postToAPI("&endpoint=samples&sampleType=" + sampler, { recordingData: sampleRecordingData })
			.then(function(data) {
				console.log(data);
				for(let samplerSaveButton of samplerSaveButtons) {
					samplerSaveButton.innerHTML = "Saved";
					samplerSaveButton.setAttribute("disabled", true);
				}
			});
		}
		
		function samplerSoundCapture(index) {
			if(samplerSelected() && sampleRecordingStatus) {
				if(sampleRecordingData != "") {
					sampleRecordingData += "|";
				}
				sampleRecordingData += sampleRecordingProgress + ":" + index;
				console.log("Captured Sound Index #" + index);
			}
		}
				
		for(let samplerRecordingButton of samplerRecordingButtons) {
			samplerRecordingButton.addEventListener("click", function(event) {
				samplerChangeRecordStatus();
				event.preventDefault();
			});
		}
		
		for(let samplerPlaybackButton of samplerPlaybackButtons) {
			samplerPlaybackButton.addEventListener("click", function(event) {
				samplerChangePlayStatus();
				event.preventDefault();
			});
		}
		
		for(let samplerSaveButton of samplerSaveButtons) {
			samplerSaveButton.addEventListener("click", function(event) {
				samplerSave();
				event.preventDefault();
			});
		}
		
		// Key Buttons (Piano & Drums)
		
		for(let samplerKeyButtons of samplerKeyButtonsAll) {
			const samplerKeyButtonsLi = samplerKeyButtons.querySelectorAll("li");
			for(let [index, samplerKeyButton] of Object.entries(samplerKeyButtonsLi)) {
				samplerKeyButton.addEventListener("mousedown", function(event) {
					instrumentSoundPlay(instrumentSounds, samplerSelected(), index);
					samplerSoundCapture(index);
					event.preventDefault();
				});
			}
		}
		
		// Theremin
		
		const samplerThereminSlider = document.querySelector(".sampler-slider");
		
		samplerThereminSlider.addEventListener("input", function(event) {
			let index = samplerThereminSlider.value;
			instrumentSoundPlay(instrumentSounds, "theremin", index);
			samplerSoundCapture(index);
		});
		
		// Keyed Instruments on Keyboards
		
		function samplerKeyDown(event) {
			if(event.key >= 1 && event.key <= 8) {
				instrumentSoundPlay(instrumentSounds, samplerSelected(), event.key-1);
				samplerSoundCapture(event.key-1);
				event.preventDefault();
			}
		};
		
		function onRender(event) {
			
			let sampler = samplerSelected();
			
			if(sampler == "piano" || sampler == "drums") {
				document.addEventListener("keydown", samplerKeyDown);
			}
			else {
				document.removeEventListener("keydown", samplerKeyDown);
			}
			
		}
		
		onRender();
		window.addEventListener("hashchange", onRender);
	
	}
	
	// Setup Leaflet for Location Goodies
	
	function initLeaflet() {
		return L.map("leaflet-map");
	}
	
	// Setup Now Playing with Playback Function
	
	function initNowPlaying(musicMap, instrumentSounds) {
	
		// Setup Initial Variables
		
		let compositionPlaybackDuration = config().compositionPlaybackDuration;
		let compositionPlaybackInterval = config().sampleRecordingDuration + 1000;
		let compositionPlaybackStatus = false;
		let compositionPlaybackProgress = 0;
		let compositionPlaybackTimeout;
		
		let closestComposition;
		let selectedSample = {};
		let samplesToPlay = [];
		
		const nowPlayingEmpty = document.querySelector("#now-playing-empty");
		const nowPlayingInsert = document.querySelector("#now-playing-insert");
		const nowPlayingCompositionTitle = document.querySelector("#now-playing-insert > h2");
		const nowPlayingSamples = document.querySelector("#now-playing-samples");
		const nowPlayingInsertButton = document.querySelector("#now-playing-insert-button");
		const nowPlayingPlayCompositionButton = document.querySelector("#now-playing-play-composition-button");
		
		// Instrument Playback
		
		function samplerPlayback(instrument) {
			if(samplePlaybackStatus && samplePlaybackProgress <= sampleRecordingDuration) {
				console.log("Sample Playing Back... " + samplePlaybackProgress);
				sampleRecordingDataChunks = sampleRecordingData.split("|");
				for(let chunk of sampleRecordingDataChunks) {
					chunk = chunk.split(":");
					if(chunk[0] == samplePlaybackProgress) {
						instrumentSoundPlay(instrumentSounds, instrument, chunk[1]);
					}
				}
				samplePlaybackProgress = samplePlaybackProgress + sampleRecordingInterval;
				samplePlaybackTimeout = setTimeout(function() {
					samplerPlayback(instrument);
				}, sampleRecordingInterval);
			}
			else {
				console.log("Ended Sample Playback Automatically");
				//samplerChangePlayStatus();
			}
		}
		
		// Change Play Status of Instrument
		
		function samplerChangePlayStatus(instrument = "piano") {
			const nowPlayingSamplesLis = document.querySelectorAll("#now-playing-samples > li");
			if(sampleRecordingData != "") {
				if(samplePlaybackStatus) {
					console.log("Change Instrument Status: End");
					clearTimeout(samplePlaybackTimeout);
					samplePlaybackStatus = false;
					samplePlaybackProgress = 0;
				}
				else {
					console.log("Change Instrument Status: Start");
					samplePlaybackStatus = true;
					samplerPlayback(instrument);
				}
			}
			else {
				console.log("Nothing's Been Recorded Yet");
			}
		}
		
		// Composition Playback
		
		function compositionPlayback(samplesToPlay, index) {
			if(compositionPlaybackStatus) {
				console.log("Composition Playing Back... " + compositionPlaybackProgress);
				if(typeof samplesToPlay[index] == "undefined") {
					index = 0;
				}
				sampleToPlay = samplesToPlay[index];
				sampleRecordingData = sampleToPlay.recording_data;
				samplePlaybackStatus = false;
				samplePlaybackProgress = 0;
				samplerChangePlayStatus(sampleToPlay.type);
				compositionPlaybackProgress = compositionPlaybackProgress + compositionPlaybackInterval;
				index++;
				compositionPlaybackTimeout = setTimeout(function() {
					compositionPlayback(samplesToPlay, index);
				}, compositionPlaybackInterval);
			}
		}
		
		// Change Play Status of Composition
		
		function compositionChangePlayStatus(samplesToPlay) {
			const nowPlayingSamplesLis = document.querySelectorAll("#now-playing-samples > li");
			if(compositionPlaybackStatus) {
				console.log("Change Composition Status: End");
				clearTimeout(compositionPlaybackTimeout);
				compositionPlaybackStatus = false;
				compositionPlaybackProgress = 0;
				nowPlayingPlayCompositionButton.innerHTML = "Play Composition 🔈";
			}
			else {
				for(let nowPlayingSamplesLi of nowPlayingSamplesLis) {
					nowPlayingSamplesLi.classList.remove("selected");
				}
				console.log("Change Composition Status: Start");
				compositionPlaybackStatus = true;
				compositionPlayback(samplesToPlay, 0);
				nowPlayingPlayCompositionButton.innerHTML = "Pause Composition 🔇";
			}
		}
		
		function onRender() {
			
			if(getHashFull() == "now-playing") {
					
				// Check If Current Location Is On a Composition
				
				locationCurrent = {lat: -27.5003, lng: 153.015}; // Fake
				let locationCurrentLatLng = L.latLng(locationCurrent);
				
				getData("compositions", true).then(function(compositions) {
				
					for(let composition of compositions) {
						
						let locationComposition = composition.latlong.split(",");
						locationComposition = {lat: locationComposition[0], lng: locationComposition[1]};
						let locationCompositionLatLng = L.latLng(locationComposition);
					
						let distanceBetween = locationCurrentLatLng.distanceTo(locationCompositionLatLng);
						
						if(distanceBetween < 100) {
							closestComposition = composition;
							console.log(distanceBetween + " Metres Away");
						}
					
					}
					
					if(closestComposition) {
					
						nowPlayingEmpty.classList.remove("active");
						nowPlayingInsert.classList.add("active");
						
						nowPlayingCompositionTitle.innerHTML = closestComposition.title;
						
						getData("samples").then(function(samples) {
							
							// Create List of Samples for Individual Playback
							
							nowPlayingSamples.innerHTML = "";
						
							for(let sample of samples) {
								
								let nowPlayingSamplesLi = document.createElement("li");
								let nowPlayingSamplesLiText = document.createTextNode(sample.id);
								nowPlayingSamplesLi.appendChild(nowPlayingSamplesLiText);
							
								nowPlayingSamplesLi.addEventListener("mousedown", function(event) {
										
									if(!this.classList.contains("disabled")) {
										
										if(compositionPlaybackStatus) {
											compositionChangePlayStatus();	
										}
										if(samplePlaybackStatus) {
											samplerChangePlayStatus();
										}
										const nowPlayingSamplesLis = document.querySelectorAll("#now-playing-samples > li");
										for(let nowPlayingSamplesLi of nowPlayingSamplesLis) {
											nowPlayingSamplesLi.classList.remove("selected");
										}
									
										this.classList.add("selected");
										selectedSample = sample;
										console.log("Sample Selected " + selectedSample.id);
										
										sampleRecordingData = sample.recording_data;
										samplerChangePlayStatus(sample.type);
										console.log("Started Sample Playback " + sample.id + " with recording_data: " + sample.recording_data);
									
									}
												
									event.preventDefault;
									
								});
								
								nowPlayingSamples.append(nowPlayingSamplesLi);
							
							}
							
							// Samples to Compositions
							
							getData("samples_to_compositions").then(function(samplesToCompositions) {
								
								const nowPlayingSamplesLis = document.querySelectorAll("#now-playing-samples > li");
							
								for(let sampleToComposition of samplesToCompositions) {
									if(sampleToComposition.compositions_id == closestComposition.id) {
										for(let sample of samples) {
											if(sample.id == sampleToComposition.samples_id) {
												samplesToPlay.push(sample);
												for(let nowPlayingSamplesLi of nowPlayingSamplesLis) {
													if(sample.id == nowPlayingSamplesLi.innerHTML) {
														nowPlayingSamplesLi.classList.add("disabled");
													}
												}
											}
										}
									}
								}
								
								nowPlayingPlayCompositionButton.addEventListener("click", function(event) {
									if(samplePlaybackStatus) {
										samplerChangePlayStatus();
									}
									compositionChangePlayStatus(samplesToPlay);
									event.preventDefault();
								});
							
							});
						
						});
						
						// Insert Sample on Button Click
		
						nowPlayingInsertButton.addEventListener("click", function(event) {
							if(selectedSample) {
								const nowPlayingSamplesLiSelected = document.querySelector("#now-playing-samples > li.selected");
								nowPlayingSamplesLiSelected.className = "";
								nowPlayingSamplesLiSelected.classList.add("disabled");
								alert("Inserted Sample #" + selectedSample + " Into Composition #" + closestComposition.id);
								samplesToPlay.unshift(selectedSample);
								/*postToAPI("&endpoint=samples_to_compositions&compositionID=" + closestComposition.id + "&sampleID=" + selectedSample.id)
								.then(function(data) {
									console.log(data);
								});*/
							}
							event.preventDefault();
						});
						
					}
				
				});
			
			}
			
		}
		
		onRender();
		window.addEventListener("hashchange", onRender);
		
	}
	
	// Setup Music Map
	
	function initMusicMap(musicMap) {
		
		// Get Current Location & Put On Map
		
		function musicMapLocate() {
			musicMap.locate({
				setView: true,
				maxZoom: 16,
				watch: true,
				enableHighAccuracy: true
			});
		}
		
		// Set Initial Map View (Defaulting to UQ)
		
		musicMap.setView(locationCurrent, 16);
		
		// Get Custom Tiles from Mapbox
		
		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
			minZoom: 3,
			maxZoom: 20,
			id: 'mattluscombe/cktcl2j8r0gux17p4ke5icb9n',
			tileSize: 512,
			zoomOffset: -1,
			accessToken: 'pk.eyJ1IjoibWF0dGx1c2NvbWJlIiwiYSI6ImNrdGF5NWozbjAzMjIycW9haXJzOWdia3YifQ.1zaWEkyPBOF5z9tm1aYQ8g',
			detectRetina: true
		}).addTo(musicMap);
		
		// Only Render When Navigated To
		
		function onRender() {
		
			if(getHashFull() == "music-map") {
				
				musicMap.invalidateSize();
			
				// Generate Circles for Compositions
					
				let circles = [];
				
				getData("compositions", true).then(function(compositions) {
				
					for(let composition of compositions) {
						let latlong = composition.latlong.split(",");
						let circle = L.circle([latlong[0], latlong[1]], {
							color: "black",
							fillColor: "black",
							fillOpacity: 0.5,
							radius: 50,
							className: "map-circle"
						}).addTo(musicMap);
						circle.bindPopup(composition.id + ": " + composition.title);
						circles.push(circle);
					}
					
					// Set Current Location on Map Whenever Map Becomes Visible
					
					locationCurrent = {lat: -27.5003, lng: 153.015}; // Fake
					let circle = L.circle(locationCurrent, 20, {}).addTo(musicMap);
					
					for(let circle of circles) {
						//console.log(circle);
						let locationCurrentLatLng = L.latLng(locationCurrent);
						let distanceToCircle = locationCurrentLatLng.distanceTo(circle._latlng);
						if(distanceToCircle < 100) { // Less Than 100 Metres
							circle.setStyle({
								color: "red",
								fillColor: "red"
							});
							console.log(distanceToCircle + " Metres Away");
						}
					}
					
					//musicMapLocate();
			
					musicMap.on("locationfound", function(e) {
						let radius = e.accuracy;
						locationCurrent = e.latlng;
						let circle = L.circle(locationCurrent, radius, {}).addTo(musicMap);
						circle.bindPopup("This is your current location");
						musicMap.setView(locationCurrent, 16);
					});
				
				});
			
			}
		
		}
		
		onRender();
		window.addEventListener("hashchange", onRender);
	
	}
	
	// Call All of These Functions
	
	// Initialise URL Routing
	initHash();
	window.addEventListener("hashchange", initHash);
	
	// Initialise Instruments
	let instrumentSounds = initInstrumentSounds();
	
	// Initialise Sampler
	initSampler(instrumentSounds);
	
	// Initialise Leaflet
	let musicMap = initLeaflet();
	
	// Initialise Now Playing
	initNowPlaying(musicMap, instrumentSounds);
	
	// Initialise Music Map
	initMusicMap(musicMap);

}

// When Document is Ready, Initialise App

document.addEventListener("readystatechange", function(event) {
	if(event.target.readyState == "interactive") {
		initApp();
	}
});