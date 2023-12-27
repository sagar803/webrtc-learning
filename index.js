const messageSound = new Audio('./ding.mp3');
const peerConnection = new RTCPeerConnection();

let answerElement = document.getElementById('answer');
let offerElement = document.getElementById('offer');
let callButton = document.getElementById('call-button');
let incomingButton = document.getElementById('incoming-button');
let acceptedButton = document.getElementById('accepted-button');
let receivedMsgElement = document.getElementById('received-msg');
let sendMsgElement = document.getElementById('send-msg');

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localVideo.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  })
  .catch(error => console.error('Error accessing media devices:', error));

peerConnection.ontrack = event => {
  const remoteStream = event.streams[0];
  remoteVideo.srcObject = remoteStream;
};

peerConnection.onicecandidate = e => offerElement.innerText = JSON.stringify(peerConnection.localDescription);

const handleCall = async () => {
    try {
        const sendChannel = peerConnection.createDataChannel('channel');
        peerConnection.channel = sendChannel;

        sendChannel.onopen = e => alert('Connected');
        sendChannel.onclose = e => alert('Disconnected');
        sendChannel.onmessage = e => handleReceivedMessage(e);

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log('Set successfully');
    } catch (error) {
        console.error('Error creating or setting local description:', error);
    }
};


const handleIncomingCall = async () => {
    const offer = JSON.parse(document.getElementById('incoming-sdp').value);

    peerConnection.ontrack = event => {
        const remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    peerConnection.ondatachannel = (e) => {
        const receiveChannel = e.channel;
        receiveChannel.onmessage = e => handleReceivedMessage(e);
        receiveChannel.onopen = e => alert('Connected');
        receiveChannel.onclose = e => alert('Disconnected');
        peerConnection.channel = receiveChannel;
    };

    await peerConnection.setRemoteDescription(offer);

    try {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        answerElement.innerText = JSON.stringify(peerConnection.localDescription);
    } catch (error) {
        console.error('Error creating or setting local description:', error);
    }
};


const handleCallAccepted = () => {
    const answer = JSON.parse(document.getElementById('accepted').value);
    peerConnection.setRemoteDescription(answer);
};

const handleSendMsg = () => {
    peerConnection.channel.send(sendMsgElement.value);
};

const handleReceivedMessage = (e) => {
    messageSound.play();
    receivedMsgElement.innerText = 'New Message: ' + e.data;
};

callButton.addEventListener("click", handleCall);
incomingButton.addEventListener('click', handleIncomingCall);
acceptedButton.addEventListener("click", handleCallAccepted);

function copyText(id) {
    var textToCopy = document.getElementById(id);
    var textarea = document.createElement('textarea');
    textarea.value = textToCopy.innerText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}


