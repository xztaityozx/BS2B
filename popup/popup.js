"use strict";


// Elements
const textArea=document.getElementById("message");
const sendButton=document.getElementById("sendButton");
const appendButton=document.getElementById("appendButton");
const resumeButton=document.getElementById("resumeButton");
const pauseButton=document.getElementById("pauseButton");
const info=document.getElementById("info");
const skipButton=document.getElementById("skipButton");
const isKeepCheck=document.getElementById("isKeep");
const doClearCheck=document.getElementById("doClear");
const resetButton=document.getElementById("resetButton");

// print error log
const onErr=function(err){
    console.log("----err----")
    console.error(err)
};

// print msg
const log=function(msg){
    console.log(`-----log----`);
    console.log(msg);
}

// button action @sendButton
const getSelectedItem=function(){
    browser.tabs.executeScript({
        file: "./getSelect.js"
    });
}

const storeConfig=function(){
    const iskeep=isKeepCheck.checked;
    const doClear=doClearCheck.checked;
    browser.storage.local.set({iskeep,doClear}).then(log,onErr);
}

const getConfig=function(){
    browser.storage.local.get("iskeep").then((res)=>{
        isKeepCheck.checked=res["iskeep"];
    },onErr);
    browser.storage.local.get("doClear").then((res)=>{
        doClearCheck.checked=res["doClear"];
    },onErr);
}

// https://github.com/chocoa/BouyomiChan-WebSocket-Plugin
const sendMessage=function(command){
    infoCtrl(1);

    var delim = "<bouyomi>";
    var speed = -1; 
    var pitch = -1; 
    var volume = -1; 
    var type = 0; 
    const text = textArea.value;




    var prefix = ""+ command+ delim + speed + delim + pitch + delim + volume + delim + type + delim;
    if(command===0x0001){
        text.split(/\n/).forEach(element => {
            if(element==="") return;
            if(encodeURI(element).replace(/%../g,"x").length>946) sendText(prefix+"Skipします");
            else sendText(prefix+element);
        });    
    }else {
        sendText(prefix+"");
    }
}

const sendText=function(inst){
    var socket = new WebSocket(`ws://localhost:50002/`);
    socket.onerror=function(e){
        infoCtrl(2);
        onErr(e);
    }
    socket.onmessage=function(e){}
    socket.onclose=function(e){}
    socket.onopen = function() {
        infoCtrl(3);
        socket.send(inst);
    };
}

// info control
const infoCtrl=function(status){
    if(status===0){
        // waiting
        info.innerText="Waiting";
        info.className="btn btn-dark"
    } else if(status===1) {
        // sending
        info.innerText="Connect";
        info.className="btn btn-outline-primary"
    } else if(status===2){
        // Errored
        info.className="btn btn-danger";
        info.innerText="Errored";
    } else if(status===3){
        // connected
        info.innerText="Success";
        info.className="btn btn-success";
    } else {
        // unknown
        info.className="btn btn-warning";
        info.innerText="Unknown";
    }
}

// Commands
const skip=function(){
    sendMessage(0x0030);
}
const pause=function(){
    sendMessage(0x0010);
}
const resume=function(){
    sendMessage(0x0020);
}
const send=function(){
    sendMessage(0x0001);
    if(doClearCheck.checked) reset();
}
const reset=function(){
    textArea.value="";
    storeText("");
}


const storeText=function(FS2Btext) {
    if(!isKeepCheck.checked) FS2Btext="";
    browser.storage.local.set({FS2Btext}).then(()=>{
        console.log("FS2B : stored text");
    },onErr);
}



// init function
const init=function(){
    // add action to buttons
    appendButton.onclick=getSelectedItem;
    sendButton.onclick=send;
    skipButton.onclick=skip;
    resumeButton.onclick=resume;
    pauseButton.onclick=pause;
    resetButton.onclick=reset;


    textArea.onchange=()=>{
        storeText(textArea.value);
    }
    isKeepCheck.onchange=storeConfig;
    doClearCheck.onchange=storeConfig;

    // add listener
    browser.runtime.onMessage.addListener((event)=>{
        log(event.data);
        browser.storage.local.get("FS2Btext").then((res)=>{
            console.log(res);
            const text = res["FS2Btext"] + event.data;
            textArea.value=text;
            storeText(text);
        });
    });

    // get current selected text
    getSelectedItem();
    // Config
    getConfig();
}

init();
