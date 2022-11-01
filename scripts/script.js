// Handle errors.
let handleError = function (err) {
  console.log("Error: ", err);
};

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById("remote-container");

// Add video streams to the container.
function addVideoStream(elementId) {
  // Creates a new div for every stream
  let streamDiv = document.createElement("div");
  // Assigns the elementId to the div.
  streamDiv.id = elementId;
  // Takes care of the lateral inversion
  streamDiv.style.transform = "rotateY(180deg)";
  // Adds the div to the container.
  remoteContainer.appendChild(streamDiv);
}

// Remove the video stream from the container.
function removeVideoStream(elementId) {
  let remoteDiv = document.getElementById(elementId);
  if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
}


let client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8",
});

client.init(
  "e4fc13e59b1d4105b5dd434a56a2bf94",
  function () {
    console.log("client initialized");
  },
  function (err) {
    console.log("client init failed ", err);
  }
);

// The value of role can be "host" or "audience".
let role = getUrlVars()["role"];
// let role='host'
client.setClientRole(role);

// Join a channel
client.join(
  "007eJxTYDhnlyL9M/3J3vsxMqbhs57/F7h4No1RWbd69YZzbXe7OIsUGFJN0pINjVNNLZMMU0wMDUyTTFNSTIxNEk3NEo2S0ixNgvoSkxsCGRmmzvrOyMjAyMACxCA+E5hkBpMsYJKbISezLLUktbjE0MiYgQEA/6Uljw==",
  "livetest123",
  null,
  (uid) => {
    // Create a local stream
    if (role == "host") {
      createLocalStream();
    }
  },
  handleError
);
// Create a local stream
function createLocalStream(){ 
  // Create a local stream
    let localStream = AgoraRTC.createStream({
      audio: true,
      video: true,
    });
    // Initialize the local stream
    localStream.init(() => {
      // Play the local stream
      localStream.play("me");
      // Publish the local stream
      client.publish(localStream, handleError);
    }, handleError);
}

// Subscribe to the remote stream when it is published
client.on("stream-added", function(evt){
    client.subscribe(evt.stream, handleError);
});
// Play the remote stream when it is subsribed
client.on("stream-subscribed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    addVideoStream(streamId);
    stream.play(streamId);
});
//When a remote user unpublishes the stream or leaves the channel, stop the stream playback, and remove its view.
// Remove the corresponding view when a remote user unpublishes.
client.on("stream-removed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});
// Remove the corresponding view when a remote user leaves the channel.
client.on("peer-leave", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});


//get url params




function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    }
  );
  return vars;
}