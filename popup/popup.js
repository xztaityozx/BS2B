"use strict";

import net from "net";

const textArea=document.getElementById("message");
const ipAddressFrom=document.getElementById("ipaddress");
const portFrom=document.getElementById("port");
const sendButton=document.getElementById("sendButton");
const getButton=document.getElementById("getButton");

const onErr=function(err){
    console.log("----err----")
    console.error(err)
};

const log=function(msg){
    console.log(`-----log----`);
    console.log(msg);
}

// set configurations
const setIP=function(ip){
    const val=ip["ip"];
    if (val === undefined) {
        val=""
    }
    ipAddressFrom.value=val;
}
const setPort=function(port){
    const val = port["port"];
    if (val === undefined) {
        val=""
    }
    portFrom.value=val;
}

// store Configuration 
// ip : ip-address of Bouyomichan
// port : port number of Bouyomichan
const storeConfig=function(){
    const ip = ipAddressFrom.value;
    const port = portFrom.value;
    browser.storage.local.set({ip,port}).then(()=>{log("[OK] store")},onErr);
}

// button action @sendButton
const getSelectedItem=function(){
    browser.tabs.executeScript({
        file: "./getSelect.js"
    });
}

const send=function(inst){
    const client=new net.Socket();
    client.connect(port,ip,()=>{
        console.log("Connected");
        console.log(inst);
        client.write(inst);
    });
}



// init function
const init=function(){
    // add action to forms
    ipAddressFrom.onchange=storeConfig;
    portFrom.onchange=storeConfig;

    // add action to buttons
    getButton.onclick=getSelectedItem;

    // add listener
    browser.runtime.onMessage.addListener((event)=>{
        log(event.data);
        textArea.value += event.data;
    });

    // get current selected text
    getSelectedItem();

    // set configurations
    browser.storage.local.get("ip").then(setIP,onErr);
    browser.storage.local.get("port").then(setPort,onErr);
}

init();
