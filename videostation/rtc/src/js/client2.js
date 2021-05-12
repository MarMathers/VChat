(async function () {

    let m_call_in, m_call_out, m_slide_out, m_contacts_menu,
        m_bandwidthSelector, m_bandwidth_out_Selector = undefined
    // let handleOnCancelOutCall, handleOnAcceptInCall, handleOnDeclineInCall=undefined
    let isOnline = false
    var t = window.setInterval(function () {
        if (!isOnline) {
            location.reload()
        }
    }, 10000);

    async function handleOnAcceptInCall() {
        answ_offer = await pc.createAnswer()
        await pc.setLocalDescription(answ_offer);

        const desc = {
            type: answ_offer.type,
            sdp: bandwidth === 'unlimited' ?
                answ_offer.sdp :
                setMediaBitrate(setMediaBitrate(answ_offer.sdp, "video", Math.round(0.9 * bandwidth)), "audio", Math.round(0.1 * bandwidth))
        };
        await sendMessage('rtc', user_number, remote_number, { description: desc })

        // await sendMessage('rtc', user_number, remote_number, { description: pc.localDescription })
        console.log('ANSWER', answ_offer)
        $('#localVideo').addClass("calling")
        $('#remoteVideo').show()
        $('.cpplace').show()


        $.each($('#rington'), function () {
            this.pause();
        });
        $.each($('#sound_connected'), function () {
            this.play();
        });
    }
    const handleOnDeclineInCall = async () => {
        sendMessage('rtc', user_number, remote_number, { close: true, decline: true })
        closeVideoCall()
    }
    const handleOnCancelOutCall = async () => {
        sendMessage('rtc', user_number, remote_number, { close: true })
        closeVideoCall()
    }
    document.addEventListener('keydown', async function (event) {
        console.log('CODE', event.code)
        switch (event.code) {
            case 'Enter':
            case 'Space':
                if (m_call_in.isOpen) {
                    await handleOnAcceptInCall()
                    m_call_in.close()
                }
                break
            case 'Escape':
                if (m_call_in.isOpen) {
                    await handleOnDeclineInCall()
                    m_call_in.close()
                }
                if (m_call_out.isOpen || streaming) {
                    await handleOnCancelOutCall()
                    m_call_out.close()
                }

                break
            default: break
        }
        // if (event.code=='Enter)
    })
    document.addEventListener('DOMContentLoaded', function () {
        m_contacts_menu = M.Sidenav.init(document.querySelector('#contacts-menu'), { edge: 'right' });
        m_slide_out = M.Sidenav.init(document.querySelector('#slide-out'), {});
        m_bandwidthSelector = M.FormSelect.init(document.querySelectorAll('#band_select'), {});
        m_bandwidth_out_Selector = M.FormSelect.init(document.querySelectorAll('#band_out_select'), {});



        M.Collapsible.init(document.querySelector('.collapsible'), {});
        var elems = document.querySelectorAll('.fixed-action-btn');
        var instances = M.FloatingActionButton.init(elems, {});
        $('.logos').on('click', '', async () => {
            m_slide_out.open()
        })
        $('#micButton').on('click', '', async () => {
            if ($('#micButton>i').html() === 'mic') {
                $('#micButton>i').html('mic_off')
                $('#micButton>i').addClass('grey')
            } else {
                $('#micButton>i').html('mic')
                $('#micButton>i').removeClass('grey')
            }
            toggleTrack(localVideo.srcObject.getAudioTracks())
        })
        $('#camButton').on('click', '', async () => {
            if ($('#camButton>i').html() === 'videocam') {
                $('#camButton>i').html('videocam_off')
                $('#camButton>i').addClass('grey')
            } else {
                $('#camButton>i').html('videocam')
                $('#camButton>i').removeClass('grey')
            }
            toggleTrack(localVideo.srcObject.getVideoTracks())

        })
        $('#modal_call_out').on('click', '.cancel', handleOnCancelOutCall)
        $('#modal_call_in').on('click', '.accept', handleOnAcceptInCall)
        $('#modal_call_in').on('click', '.cancel', handleOnDeclineInCall)
        m_call_in = M.Modal.init(document.querySelector('#modal_call_in'), {
            dismissible: false,
            onCloseStart: async () => {
                $.each($('#rington'), function () {
                    this.pause();
                });
            },
            onOpenStart: () => {
                document.querySelector('#in_modal_number').innerHTML = remote_number
                document.querySelector('#in_modal_name').innerHTML = contacts.find(c => c.number === remote_number).name
                document.querySelector('#in_modal_place').innerHTML = contacts.find(c => c.number === remote_number).place
                $.each($('#rington'), function () {
                    this.play();
                });
            }
        });
        m_call_out = M.Modal.init(document.querySelector('#modal_call_out'), {
            dismissible: false,
            onCloseStart: async () => {

                $.each($('#kpv'), function () {
                    this.pause();
                });
                $.each($('#busy'), function () {
                    this.pause();
                });


            },
            onOpenStart: () => {
                document.querySelector('#out_modal_number').innerHTML = remote_number
                document.querySelector('#out_modal_name').innerHTML = contacts.find(c => c.number === remote_number).name
                document.querySelector('#out_modal_place').innerHTML = contacts.find(c => c.number === remote_number).place
                $.each($('#kpv'), function () {
                    this.play();
                });
            }
        });


    });

    const webSocketStatus = $('.status')
    function setWebSocketStatus(value) {
        webSocketStatus.html(value)
    }
    var width = 320;    // We will scale the photo width to this
    var height = 0;     // This will be computed based on the input stream

    let bandwidth, bandwidth_out = 0
    let contacts = []
    var streaming = false;
    let isOfferer = false
    const user_number = localStorage['user_number']
    let remote_number = null

    let ignoreOffer = false
    const polite = true

    // let bitrateSeries = new TimelineDataSeries();
    // let bitrateGraph = new TimelineGraphView('bitrateGraph', 'bitrateCanvas');
    // bitrateGraph.updateEndDate();

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');
    const bandwidthSelector = document.querySelector('select#band_select');
    const bandwidth_out_Selector = document.querySelector('select#band_out_select');
    remoteVideo.addEventListener('canplay', function (ev) {
        if (!streaming) {

            streaming = true;
        }
    }, false);



    contactList = document.getElementById('contacts');


    outButton = document.getElementById('outButton');
    outButton.addEventListener('click', handleOnCancelOutCall)

    try {
        /*const stream_cam= await navigator.mediaDevices.getUserMedia({
            audio: true,
                video: {
                frameRate: 30,
                facingMode: "user"
            }
        })*/
        const stream_screen = await navigator.mediaDevices.getUserMedia({ audio: true,video: {mediaSource: 'screen'}})
          handleStream(stream_screen)
    } catch (err) {
        try {
            console.log("An error occurred: " + err);
            localVideo.srcObject = await navigator.mediaDevices.getUserMedia({ audio: true })
        }
        catch (err) {
            console.log("An error occurred: " + err);
            alert("Невозможно подключиться к медиаустройствам. Проверьте настройки камеры и микрофона")
            location.reload()
        }
    }
    let sendChannel = undefined

    const toggleTrack = (t) => {
        t.forEach(at => {

            at.enabled = !at.enabled
        });
    }
   /* function gotStream(stream) {
        console.log("Received local stream");
        var video = document.createElement('video');
        video.addEventListener('loadedmetadata',function(){
            var canvas = document.createElement('canvas');
            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);
            var url = canvas.toDataURL();
            console.log(url);
            // will open the captured image in a new tab
            window.open(url);
          },false);
        video.src = URL.createObjectURL(stream);
        video.play();
        }*/
        function handleStream (stream) {
            const video = document.querySelector('video')
            localVideo.srcObject = stream
            localVideo.show
            localVideo.onloadedmetadata = (e) => video.play()
          }
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    let pc = null;
    async function createPeerConnection() {
        const config = {
            iceServers: [
                {
                    urls: "turn:37.228.117.135:3478",
                    username: "turnserver",
                    credential: "turnserver"
                }
            ]
        }
        pc = new RTCPeerConnection(config);
        pc.onicecandidate = handleICECandidateEvent;
        pc.ontrack = handleTrackEvent;
        pc.onnegotiationneeded = handleNegotiationNeededEvent;
        pc.onremovetrack = handleRemoveTrackEvent;
        // pc.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        // pc.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        pc.onsignalingstatechange = handleSignalingStateChangeEvent;
        pc.ondatachannel = hndlDataChannel
        sendChannel = pc.createDataChannel('sendChannel')
    }
    const handleICECandidateEvent = ({ candidate }) => {
        console.log(candidate)
        if (candidate) sendMessage('rtc', user_number, remote_number, { candidate });

    }
    const handleTrackEvent = ({ track, streams }) => {
        console.log('ON TRACK', streams[0]);
        track.onunmute = () => {
            if (remoteVideo.srcObject) {
                return;
            }
            remoteVideo.srcObject = streams[0];
            $('#contacts').hide('fast')
            sendMessage("busy", user_number, null, true)
            // M.Modal.getInstance(document.querySelector('#modal_call_out')).close();
            m_call_out.close()
            $.each($('#sound_connected'), function () {
                this.play();
            });

        };
    };
    const handleNegotiationNeededEvent = async () => {
        let desc = undefined;
        try {
            if (isOfferer) {
                makingOffer = true;
                console.log('making OFFER')
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer);
                desc = {
                    type: offer.type,
                    sdp: bandwidth === 'unlimited' ?
                        offer.sdp :
                        setMediaBitrate(setMediaBitrate(offer.sdp, "video", Math.round(0.9 * bandwidth)), "audio", Math.round(0.1 * bandwidth))
                };
                // console.log('Applying bandwidth restriction to setRemoteDescription:\n' + desc.sdp);


            }
        } catch (err) {
            console.error(err);
        } finally {
            await sendMessage('rtc', user_number, remote_number, { description: desc });
            $('#localVideo').addClass("calling")
            $('#remoteVideo').show()
            $('.cpplace').show()
            makingOffer = false;
        }
    };
    const handleRemoveTrackEvent = ((ev) => {
        if (remoteVideo.srcObject.getTracks().length === 0) closeVideoCall();
    })
    const handleSignalingStateChangeEvent = ((evt) => {
        if (evt.srcElement) {
            switch (evt.srcElement.signalingState) {
                case 'connected':
                    break;
                case 'disconnected':
                case 'failed':
                case 'closed':
                    closeVideoCall();
                    break;
                default: break
            }
            console.log('PC STATE: ', evt.srcElement.signalingState)
        } else
            console.log('PC EVENT ', evt)

    })
    const hndlDataChannel = (event => {
        event.channel.onopen = hdlChannelOpen
        event.channel.onclose = hdlChannelClose
        event.channel.onmessage = hdlChannelMessage
    })

    function hdlChannelOpen() { console.log('DATA CHANNEL OPEN', sendChannel) }
    function hdlChannelClose() { console.log('DATA CHANNEL CLOSE') }
    function hdlChannelMessage(event) { console.log('DATA CHANNEL MSG:', event.data) }
    function sendDCMessage(msg) {
        if (!sendChannel) return
        if (sendChannel.readyState === 'open') sendChannel.send(JSON.stringify(msg))
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    console.log('location', location)
    const ws = new WebSocket(`wss://${location.host}/wss`)

    window.onunload = () => {
        ws.close()
    }
    ws.onopen = async (event) => {
        setWebSocketStatus("ONLINE")
        sendMessage("reg", user_number)
        isOnline = true
    }

    ws.onerror = (err) => {
        console.log('ws ERROR', err)
        setWebSocketStatus(err)
        isOnline = false
    }

    ws.onclose = () => {
        setWebSocketStatus("OFFLINE")
        isOnline = false
    }

    ws.onmessage = (response) => {
        messParser(response)
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    setInterval(() => {
        // sendDCMessage(Date.now())
    }, 1000)

    async function sendMessage(t, src, dst = null, message = null) {
        // console.log('SendMessag: ', t, src, dst)
        ws.send(JSON.stringify({ type: t, src: src, dst: dst, data: message }));
    }

    async function init_pc() {
        try {
            if (!pc) await createPeerConnection()
            await localVideo.srcObject.getTracks().forEach((track) => {
                pc.addTrack(track, localVideo.srcObject);
            })
        } catch (err) {
            console.log(err)
        }
    }

    let makingOffer = false;

    async function serverMessParser(mess) {
        switch (mess.mes) {
            case 'relogin':
                closeVideoCall()
                alert(`Абонент ${user_number} зарегистрировался на другой станции.`)
                localStorage['user_number'] = undefined
                location = mess.href
                break;
            case 'busy':
                try {
                    // console.log(`User ${mess.number} busy is ${mess.data}`)
                    cont = contacts.find(c => c.number === mess.number)
                    // console.log("CONT", cont, mess)
                    if (cont) {
                        if (mess.data === 'true') {
                            document.querySelector(`#btn${mess.number}`).classList.add('busy')
                            document.querySelector(`#btn${mess.number}`).classList.remove('avail')
                            document.querySelector(`#menubtn${mess.number}`).classList.add('busy')
                            document.querySelector(`#menubtn${mess.number}`).classList.remove('avail')
                            document.querySelector(`#menuli${mess.number}`).classList.add('busy')
                            document.querySelector(`#menuli${mess.number}`).classList.remove('avail')

                        } else {
                            document.querySelector(`#btn${mess.number}`).classList.add('avail')
                            document.querySelector(`#btn${mess.number}`).classList.remove('busy')
                            document.querySelector(`#menubtn${mess.number}`).classList.add('avail')
                            document.querySelector(`#menubtn${mess.number}`).classList.remove('busy')
                            document.querySelector(`#menuli${mess.number}`).classList.add('avail')
                            document.querySelector(`#menuli${mess.number}`).classList.remove('busy')
                        }
                    } else {

                    }
                } catch (err) { console.log(err) }
                break;
            case 'in':
                console.log(`User ${mess.number} is active`)

                cont = contacts.find(c => c.number === mess.number)
                if (cont) {
                    M.toast({ html: `${cont.name} в сети!` })
                    cont.reg = true
                    $(`#btn${mess.number}`).removeClass('disabled')
                    $(`#btn${mess.number}`).removeClass('busy')
                    $(`#btn${mess.number}`).addClass('avail')
                    $(`#menubtn${mess.number}`).removeClass('disabled')
                    $(`#menubtn${mess.number}`).removeClass('busy')
                    $(`#menubtn${mess.number}`).addClass('avail')
                    $(`#menuli${mess.number}`).removeClass('disabled')
                    $(`#menuli${mess.number}`).removeClass('busy')
                    $(`#menuli${mess.number}`).addClass('avail')
                } else {

                }
                break;
            case 'out':
                console.log(`User ${mess.number} is inactive`)

                cont = contacts.find(c => c.number === mess.number)
                if (cont) {
                    M.toast({ html: `${cont.name} недоступен.` })
                    cont.reg = false
                    $(`#btn${mess.number}`).removeClass('avail')
                    $(`#btn${mess.number}`).removeClass('busy')
                    $(`#btn${mess.number}`).addClass('disabled')
                    $(`#menubtn${mess.number}`).removeClass('avail')
                    $(`#menubtn${mess.number}`).removeClass('busy')
                    $(`#menubtn${mess.number}`).addClass('disabled')
                    $(`#menuli${mess.number}`).removeClass('avail')
                    $(`#menuli${mess.number}`).removeClass('busy')
                    $(`#menuli${mess.number}`).addClass('disabled')
                } else {

                }
                if (remote_number === mess.number) {
                    closeVideoCall()
                    // alert(`Абонент ${mess.number} вышел из сети`)
                }
                break;
            case 'numbers':
                try {
                    contacts = mess.numbers
                    console.log(`GET NUMBERS LIST:`, contacts)
                    await createContactList()
                } catch (er) {
                    console.log(er)
                }
                break
            default:
                console.log(`SERVER MESS:`, mess)
                break

        }
    }

    async function createContactList() {

        contacts.forEach(c => {
            if (c.number === user_number) return
            contact = $(`
            <li class="collection-item avatar contact-bg" style="margin:3px">
            <i class="material-icons circle medium">account_box</i>
                <span class="title">${c.name}</span>
                <p><b>${c.number}</b><br>
                ${c.place}
                </li>`)

            call_button = $(`
                <a id="btn${c.number}" href="#modal_call_out" class="modal-trigger secondary-content ${c.reg ? 'avail' : 'disabled'}" data-number='${c.number}'>
                    <i  class="material-icons " style="font-size:48px">call</i>
                </a>
            `)

            call_button.click(async () => {
                remote_number = c.number
                isOfferer = true
                await init_pc()
            })
            contact.append(call_button)
            $("#contacts").append(contact)

            menu_contact = $(`
            <li id="menuli${c.number}" class="${c.reg ? 'avail' : 'disabled'}">
                <div class="collapsible-header" >
                      <i class="material-icons">account_box</i>
                      <div style="line-height:16px; padding: 5px 0 5px 0">
                      <span >${c.name}</span><br>
                      <span ><b>${c.number}</b></span ><br>
                      <span >${c.place}</span >
                        </div>
                </div>
                 <div class="collapsible-body">
                     <a class=" disabled" data-number='1356'>
                            <i class="material-icons " style="font-size:36px;padding-left: 20px;">message</i>
                     </a>
                  </div>
            </li>
            `)

            call_menu_button = $(`
                <a id="menubtn${c.number}" href="#modal_call_out" class="modal-trigger right ${c.reg ? 'avail' : 'disabled'}" data-number='${c.number}'>
                    <i  class="material-icons " style="font-size:36px;padding-right: 20px;">call</i>
                </a>
            `)

            call_menu_button.click(async () => {
                remote_number = c.number
                isOfferer = true
                m_contacts_menu.close();

                await init_pc()
            })
            menu_contact.find('.collapsible-body').append(call_menu_button)
            // console.log("menu_contact.find('.collapsible-body')", menu_contact.find('.collapsible-body'))
            $("#contacts-menu").append(menu_contact)


        })
    }
    const handleCallBegin = async () => {
        remote_number = c.number
        isOfferer = true
        await init_pc()
    }
    async function messParser(response) {
        try {
            mess = JSON.parse(response.data)
            // console.log(mess);
            switch (mess.type) {
                case 'server_mes':
                    serverMessParser(mess)
                    break
                case 'rtc':
                    remote_number = mess.src;
                    if (mess.data.description) {
                        desc = { ...mess.data.description }
                        if (!pc) await createPeerConnection()
                        const offerCollision = (desc.type == "offer") &&
                            (makingOffer || pc.signalingState != "stable");

                        ignoreOffer = !polite && offerCollision;

                        if (ignoreOffer) {
                            return;
                        }
                        try {


                            desc = {
                                type: desc.type,
                                sdp: bandwidth_out === 'unlimited' ?
                                    desc.sdp :
                                    setMediaBitrate(setMediaBitrate(desc.sdp, "video", Math.round(0.9 * bandwidth_out)), "audio", Math.round(0.1 * bandwidth_out))
                            };
                            console.log('PC STATUS', pc.signalingState)
                            console.log('PC STATUS', desc)
                            await pc.setRemoteDescription(desc);
                        } catch (er) {
                            console.log('setRemoteDescription(desc);', er)
                        }
                        if (desc.type === "offer") {
                            isOfferer = false
                            localVideo.srcObject.getTracks().forEach((track) => {
                                pc.addTrack(track, localVideo.srcObject);
                            })
                            // m_call_in.open();
                            const isMobile = /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent);
                            if (!has_focus&& !isMobile)
                            
                                sendNotification('Входящий вызов!', {
                                    body: `${contacts.find(c => c.number === remote_number).name}
                                    ${contacts.find(c => c.number === remote_number).place} 
                                    ${remote_number}`,
                                    image: '/static/gerb.png',
                                    dir: 'auto',
                                    vibrate: [200, 100, 200]
                                });
                            const cache = await m_call_in.open();
                        }
                    } else if (mess.data.candidate) {
                        try {
                            await pc.addIceCandidate(mess.data.candidate);
                        } catch (err) {
                            if (!ignoreOffer) {
                                throw err;
                            }
                        }
                    } else if (mess.data.ice) {
                        pc.addIceCandidate(data.ice).catch(e => {
                            console.log("Failure during addIceCandidate(): " + e.name);
                        });
                    } else if (mess.data.close) {
                        console.log('Incoming mess.data', mess.data)

                        closeVideoCall()
                        if (mess.data.decline) {
                            $.each($('#kpv'), function () {
                                this.pause();
                            });
                            $.each($('#busy'), function () {
                                this.play();
                            });
                        }
                    }
                    break
                default: break
            }
        } catch (err) {
            console.error(err, response.data);
        }
    }

    function closeVideoCall() {
        console.log('Отключение вызова')
        if (pc) {
            pc.close();
            if (pc) {
                pc.ontrack = null;
                pc.onremovetrack = null;
                pc.onremovestream = null;
                pc.onicecandidate = null;
                // pc.oniceconnectionstatechange = null;
                pc.onsignalingstatechange = null;
                // pc.onicegatheringstatechange = null;
                pc.onnegotiationneeded = null;
                pc.ondatachannel = null;
            }
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            sendMessage("busy", user_number, null, false)
            streaming = false;
            pc = null;
            isOfferer = false
            remote_number = undefined
            $('#contacts').show('slow')
            $('#localVideo').removeClass("calling")
            $('#remoteVideo').hide()
            $('.cpplace').hide()
            m_call_in.close()
            $.each($('#sound_disconnected'), function () {
                this.play();
            });


        }

        remoteVideo.srcObject = null;
    }
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    bandwidthSelector.onchange = bandwidthSelector_onchange
    function bandwidthSelector_onchange() {
        bandwidthSelector.disabled = true;
        bandwidth = bandwidthSelector.options[bandwidthSelector.selectedIndex].value;
        localStorage['BAND_IN'] = bandwidth
        if (!pc) return
        // In Chrome, use RTCRtpSender.setParameters to change bandwidth without
        // (local) renegotiation. Note that this will be within the envelope of
        // the initial maximum bandwidth negotiated via SDP.
        if ((adapter.browserDetails.browser === 'chrome' ||
            adapter.browserDetails.browser === 'safari' ||
            (adapter.browserDetails.browser === 'firefox' &&
                adapter.browserDetails.version >= 64)) &&
            'RTCRtpSender' in window &&
            'setParameters' in window.RTCRtpSender.prototype) {
            const sender = pc.getSenders()[0];
            const parameters = sender.getParameters();
            if (!parameters.encodings) {
                parameters.encodings = [{}];
            }
            if (bandwidth === 'unlimited') {
                delete parameters.encodings[0].maxBitrate;
            } else {
                parameters.encodings[0].maxBitrate = bandwidth * 1000;
            }
            sender.setParameters(parameters)
                .then(() => {
                    bandwidthSelector.disabled = false;
                })
                .catch(e => console.error(e));
            console.log('SENDER:', sender.getParameters())
            console.log('BAND:', bandwidth)
            return;
        }
    }
    bandwidth_out_Selector.onchange = bandwidth_out_Selector_onchange
    function bandwidth_out_Selector_onchange() {
        bandwidth_out_Selector.disabled = true;
        bandwidth_out = bandwidth_out_Selector.options[bandwidth_out_Selector.selectedIndex].value;
        localStorage['BAND_OUT'] = bandwidth_out
        if (!pc) return
        // In Chrome, use RTCRtpSender.setParameters to change bandwidth without
        // (local) renegotiation. Note that this will be within the envelope of
        // the initial maximum bandwidth negotiated via SDP.
        if ((adapter.browserDetails.browser === 'chrome' ||
            adapter.browserDetails.browser === 'safari' ||
            (adapter.browserDetails.browser === 'firefox' &&
                adapter.browserDetails.version >= 64)) &&
            'RTCRtpSender' in window &&
            'setParameters' in window.RTCRtpSender.prototype) {
            const sender = pc.getSenders()[0];
            const parameters = sender.getParameters();
            if (!parameters.encodings) {
                parameters.encodings = [{}];
            }
            if (bandwidth_out === 'unlimited') {
                delete parameters.encodings[0].maxBitrate;
            } else {
                parameters.encodings[0].maxBitrate = bandwidth_out * 1000;
            }
            sender.setParameters(parameters)
                .then(() => {
                    bandwidth_out_Selector.disabled = false;
                })
                .catch(e => console.error(e));
            console.log('SENDER:', sender.getParameters())
            console.log('BAND_OUT:', bandwidth_out)
            return;
        }
    }


    function setMediaBitrate(sdp, media, bitrate) {
        var lines = sdp.split("\n");
        var line = -1;
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf("m=" + media) === 0) {
                line = i;
                break;
            }
        }
        if (line === -1) {
            console.debug("Could not find the m line for", media);
            return sdp;
        }
        console.debug("Found the m line for", media, "at line", line);

        // Pass the m line
        line++;

        // Skip i and c lines
        while (lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
            line++;
        }
        if (!bitrate) return lines.join("\n");
        // If we're on a b line, replace it
        if (lines[line].indexOf("b") === 0) {
            var current_bitrate = +(lines.split('b=AS:')[0])
            console.debug("Replaced b line at line", lines[line]);
            if (bitrate < current_bitrate) {
                lines[line] = "b=AS:" + bitrate;
            } else {
                lines.remove(line)
            }
            console.debug("Replaced b line at line", lines[line]);
            return lines.join("\n");
        }

        // Add a new b line
        console.debug("Adding new b line before line", line);
        var newLines = lines.slice(0, line)
        newLines.push("b=AS:" + bitrate)
        newLines = newLines.concat(lines.slice(line, lines.length))

        return newLines.join("\n")
    }
    let lastResult, inlastResult = 0
    window.setInterval(() => {
        if (!pc) {
            return;
        }
        pc.getReceivers().forEach(receiver => {
            receiver.getStats().then(inres => {
                inres.forEach(report => {
                    // console.log("inreport", report)
                    switch (report.type) {
                        case 'codec': {
                            if (report.mimeType.startsWith('video')) {
                                $('#vcodec_in').html(`${report.mimeType} (${report.clockRate})`)
                            } else {
                                $('#acodec_in').html(`${report.mimeType} (${report.clockRate})`)
                            }
                            // console.log('report', report.mimeType)
                            break
                        }
                        case 'track': {

                            if (report.kind === 'audio') return
                            $('#wpx_in').html(`Размер картинки: ${report.frameWidth}x${report.frameHeight} пикс.`)
                            // console.log('report', report.timestamp - inlastResult.timestamp)
                            if (inlastResult) {

                                const framerate = Math.round(1000 * (report.framesReceived - inlastResult.framesReceived) /
                                    (report.timestamp - inlastResult.timestamp));


                                $('#framerate_in').html(`Кадров в секунду: ${framerate}`)

                            }
                            inlastResult = report
                            break
                        }
                        default: break
                    }
                })
                //     console.log('inlastResult', inlastResult)
                //    if (inres) inlastResult = inres;
            })
        })
        pc.getSenders().forEach(sender => {
            sender.getStats().then(res => {
                res.forEach(report => {
                    // console.log("outreport", report)
                    switch (report.type) {
                        case 'codec': {
                            if (report.mimeType.startsWith('video')) {
                                $('#vcodec_out').html(`${report.mimeType} (${report.clockRate})`)
                            } else {
                                $('#acodec_out').html(`${report.mimeType} (${report.clockRate})`)
                            }
                            // console.log('report', report.mimeType)
                            break
                        }
                        case 'media-source':
                            {
                                if (report.kind !== "video") {
                                    return;
                                }
                                $('#wpx').html(`Размер картинки: ${report.width}x${report.height} пикс.`)
                                $('#framerate').html(`Кадров в секунду: ${report.framesPerSecond}`)
                                break;
                            }
                        case 'transport':
                            {
                                if (report.dtlsState !== "connected") {
                                    return;
                                }

                                if (sender.track.kind !== "video") {
                                    return;
                                }
                                // console.log('hr', report)
                                const now = report.timestamp;
                                let sbytes = report.bytesSent;
                                let rbytes = report.bytesReceived;
                                if (lastResult && lastResult.has(report.id)) {
                                    // calculate bitrate
                                    const sbitrate = 8 * (sbytes - lastResult.get(report.id).bytesSent) /
                                        (now - lastResult.get(report.id).timestamp);
                                    const rbitrate = 8 * (rbytes - lastResult.get(report.id).bytesReceived) /
                                        (now - lastResult.get(report.id).timestamp);

                                    // console.log('bitrate', lastResult.get(report.id))


                                    const sbr = Math.round(((sbitrate) / 5000) * 100)
                                    const rbr = Math.round(((rbitrate) / 5000) * 100)
                                    $('#kbps_out').html(Math.round(sbitrate) + 'kbps')
                                    $('#kbps_in').html(Math.round(rbitrate) + 'kbps')
                                    $('#width_out').width(sbr + '%')
                                    $('#width_in').width(rbr + '%')


                                }

                                break;
                            }
                        default: break
                    }
                });
                if ((sender.track) && (sender.track.kind === "video")) lastResult = res;
            });
        })
    }, 1000);
    function sendNotification(title, options) {
        // Проверим, поддерживает ли браузер HTML5 Notifications
        if (!("Notification" in window)) {
            alert('Ваш браузер не поддерживает HTML Notifications, его необходимо обновить.');
        }

        // Проверим, есть ли права на отправку уведомлений
        else if (Notification.permission === "granted") {
            // Если права есть, отправим уведомление
            var notification = new Notification(title, options);

            function clickFunc() {
                window.focus(); this.close();
            }

            notification.onclick = clickFunc;
        }

        // Если прав нет, пытаемся их получить
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                // Если права успешно получены, отправляем уведомление
                if (permission === "granted") {
                    var notification = new Notification(title, options);

                } else {
                    alert('Вы запретили показывать уведомления'); // Юзер отклонил наш запрос на показ уведомлений
                }
            });
        } else {
            // Пользователь ранее отклонил наш запрос на показ уведомлений
            // В этом месте мы можем, но не будем его беспокоить. Уважайте решения своих пользователей.
        }
    }
    var has_focus = true
    window.onblur = function () {
        has_focus = false;
    }
    window.onfocus = function () {
        has_focus = true;
    }

    bandwidth_out_Selector_onchange()
    bandwidthSelector_onchange()
})();