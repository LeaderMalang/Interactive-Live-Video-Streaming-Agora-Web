# Interactive-Live-Video-Streaming-Agora-Web
# Start Interactive Live Video Streaming

This article describes how to build a Web project that implements the live video streaming function using the Agora SDK.

# Prerequisites
## 1. A valid Agora account.

## 2. An Agora project with an App ID and a temp token
## 3. A Windows or macOS computer meets the following requirements:
## 4. Access to the Internet. If your network has a firewall, follow the instructions in Firewall Requirements to access Agora services.
## 5.A browser that matches the supported browser list. Agora highly recommends using the latest version of Google Chrome.
## 6.Physical media input devices, such as a built-in camera and a built-in microphone.
## 7. An Intel 2.2GHz Core i3/i5/i7 processor (2nd generation) or equivalent




# Create a Web project
1. Create a folder for this project, and then create files in the following structure:


├── index.html

├── scripts
         
       └── script.js

└── styles

    |
    └── style.css


The index.html file is the web page; the script.js file includes the JavaScript code that implements the video call function; the style.css file defines the front-end styles.

2. Add the following code to index.html.

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Live Streaming</title>
    <link rel="stylesheet" href="./styles/style.css">
</head>
<body>
    <h1>
        Live Streaming<br><small style="font-size: 14pt;">Powered by Agora.io</small>
    </h1>
    <h4>Local video</h4>
    <div id="me"></div>
    <h4>Remote video</h4>
    <div id="remote-container">
    </div>
    <script src="./scripts/script.js"></script>
</body>
</html>

```


3.Add the following code to style.css.
```
*{
    font-family: sans-serif;
}
h1,h4{
    text-align: center;
}
#me{
    position: relative;
    width: 50%;
    margin: 0 auto;
    display: block;
}
#me video{
    position: relative !important;
}
#remote-container{
    display: flex;
}
#remote-container video{
    height: auto;
    position: relative !important;
}

```

# Integrate the SDK
## Through the CDN
Add the following code to the line after <head> in the index.html file:
```
  <script src="https://cdn.agora.io/sdk/release/AgoraRTCSDK-3.6.11.js"></script>
```

# Implementation
Once the project is set up, use the core APIs of the Agora Web SDK in script.js to implement the basic live video streaming function.

You need to work with two types of objects when using the Agora Web SDK:

The client object, which represents the local client. The Client methods provide the major functions for a voice/video call, such as joining a channel and publishing a stream.
Stream objects, which represent the local and remote streams. The Stream methods define the behaviors of a stream object, such as the playback control and video encoder configurations. When you call a Stream method, you need to distinguish between the local and the remote streams.
The following figure shows the API call sequence of the basic interactive streaming. Note that these methods apply to different objects.


![me](https://web-cdn.agora.io/docs-files/1592907224846)

Before you begin, it is helpful to define some functions to handle errors and add/remove views of remote users. Add the following code to the beginning of the script.js file.

```
// Handle errors.
let handleError = function(err){
        console.log("Error: ", err);
};

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById("remote-container");

// Add video streams to the container.
function addVideoStream(elementId){
        // Creates a new div for every stream
        let streamDiv = document.createElement("div");
        // Assigns the elementId to the div.
        streamDiv.id = elementId;
        // Takes care of the lateral inversion
        streamDiv.style.transform = "rotateY(180deg)";
        // Adds the div to the container.
        remoteContainer.appendChild(streamDiv);
};

// Remove the video stream from the container.
function removeVideoStream(elementId) {
        let remoteDiv = document.getElementById(elementId);
        if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
};

```

## 1.  Create a client

Create and initialize a client object to control the call. You need to replace yourAppId with the App ID of your Agora project. See Get an App ID for details.

```
let client = AgoraRTC.createClient({
    mode: "live",
    codec: "vp8",
});

client.init("yourAppId", function() {
    console.log("client initialized");
}, function(err) {
    console.log("client init failed ", err);
});

```

### Pay attention to the settings of mode and codec in the AgoraRTC.createClient method:

### mode determines the channel profile. Agora recommends using the rtc mode for one-to-one or group calls and the live mode for interactive live streaming.
### codec sets the codec that the web browser uses for encoding and decoding. If your app needs to support Safari 12.1 or earlier, set it as h264. Otherwise, set it as vp8.

## 2. Set the client role

A live streaming channel has two client roles: host and audience, and the default role is audience. After setting the channel profile to "live", your app may use the following steps to set the client role:

Ask the user to choose a role.
Call the Client.setClientRole method and pass in the client role set by the user.
``` 
// The value of role can be "host" or "audience".
client.setClientRole(role); 

```

In a live streaming channel, only the host can be heard and seen. You can also call setClientRole to change the user role after joining a channel.

## 3. Join a channel
Call client.join to join a channel. You need to generate a token to replace yourToken in the code sample below.

For testing, you can generate a temporary token in Agora Console.
For production, Agora recommends using a token generated at your server. See Generate a Token.
```
// Join a channel
client.join("yourToken", "myChannel", null, (uid)=>{
  // Create a local stream
}, handleError); 
```

## 5. Subscribe to remote streams
When a remote user publishes a stream, the SDK triggers the stream-added event. Listen to this event, and subscribe to the remote stream in the callback.

```
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
```
When a remote user unpublishes the stream or leaves the channel, stop the stream playback, and remove its view.
```

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
```

# Run the project
Agora recommends running and debugging your project through a local web server. In this section, we use the npm live-server package to set up a local web server.

Running the web app through a local server (localhost) is for testing purposes only. In production, ensure that you use the HTTPS protocol when deploying your project.

Due to security limits on HTTP addresses except 127.0.0.1, Agora Web SDK only supports HTTPS or http://localhost (http://127.0.0.1). Do not deploy your project over HTTP.
Run the following command in the terminal to install live-server.

``` npm i live-server -g ```

Change the directory to your project with the cd command.

### Run the app:

``` live-server . ```

This should automatically load the web app in your browser.

If the user role is set as host, you need to allow the browser to access your microphone and camera in the pop-up window. You should see a video stream of yourself.

### Duplicate the browser tab.

You should see two video streams in each browser window.

# If the project does not work properly, open the browser console and check for errors. The following are the most likely errors:

## INVALID_VENDOR_KEY: 
### Incorrect App ID or token. Ensure that you enter the correct App ID and token.
## DYNAMIC_USE_STATIC_KEY: 
### Token missing. Because your Agora project enables App Certificate, you need a token to join the channel.
## Media access:NotFoundError: 
### Camera/microphone error. Check that your camera and microphone are working properly.
## MEDIA_NOT_SUPPORT:
### Please use HTTPS or localhost.
## Do not debug the web app on emulated mobile devices.