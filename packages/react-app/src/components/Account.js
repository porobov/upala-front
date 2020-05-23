import React, { useState, useEffect, useRef } from 'react'
import { ethers } from "ethers";
// import BurnerProvider from 'burner-provider';
import Web3Modal from "web3modal";
import { Balance, Address } from "."
import { usePoller } from "../hooks"
import { useContractLoader, useContractReader } from "../hooks"

import WalletConnectProvider from "@walletconnect/web3-provider";
import { Button, Typography } from 'antd';
import { daiContractName } from "../config";
const { Text } = Typography;
const secrets = require("../secrets.js");

const INFURA_ID = secrets.infura_project_id;

const web3Modal = new Web3Modal({
  //network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID
      }
    }
  }
});

export default function Account(props) {

  // const createBurnerIfNoAddress = () => {
  //   if (!props.injectedProvider && props.localProvider){
  //     if(props.localProvider.connection && props.localProvider.connection.url){
  //       props.setInjectedProvider(new ethers.providers.Web3Provider(new BurnerProvider(props.localProvider.connection.url)))
  //     }else if( props.localProvider._network && props.localProvider._network.name ){
  //       props.setInjectedProvider(new ethers.providers.Web3Provider(new BurnerProvider("https://"+props.localProvider._network.name+".infura.io/v3/"+INFURA_ID)))
  //     }else{
  //       props.setInjectedProvider(new ethers.providers.Web3Provider(new BurnerProvider("https://mainnet.infura.io/v3/"+INFURA_ID)))
  //     }
  //   }else{
  //     pollInjectedProvider()
  //   }
  // }
  // useEffect(createBurnerIfNoAddress, [props.injectedProvider]);

  const pollInjectedProvider = async ()=>{
    if(props.injectedProvider){
      let accounts = await props.injectedProvider.listAccounts()
      if(accounts && accounts[0] && accounts[0] != props.account){
        //console.log("ADDRESS: ",accounts[0])
        if(typeof props.setAddress == "function") props.setAddress(accounts[0])
      }
    }
  }
  usePoller(()=>{pollInjectedProvider()},props.pollTime?props.pollTime:1999)

  const loadWeb3Modal = async ()=>{
    const provider = await web3Modal.connect();
    //console.log("GOT CACHED PROVIDER FROM WEB3 MODAL",provider)
    props.setInjectedProvider(new ethers.providers.Web3Provider(provider))
    pollInjectedProvider()
  }

  const logoutOfWeb3Modal = async ()=>{
    const clear = await web3Modal.clearCachedProvider();
    //console.log("Cleared cache provider!?!",clear)
    setTimeout(()=>{
      window.location.reload()
    },1)
  }

  let modalButtons = []
  if (web3Modal.cachedProvider) {
    modalButtons.push(
      <Button key="logoutbutton" style={{verticalAlign:"top",marginLeft:8,marginTop:4}} shape={"round"} size={"large"}  onClick={logoutOfWeb3Modal}>logout</Button>
    )
  }else{
    modalButtons.push(
      <Button key="loginbutton" style={{verticalAlign:"top",marginLeft:8,marginTop:4}} shape={"round"} size={"large"} type={"primary"} onClick={loadWeb3Modal}>connect</Button>
    )
  }

  React.useEffect(async () => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal()
    }
  }, []);


  const readContracts = useContractLoader(props.localProvider);

  const poolBalance = useContractReader(readContracts,daiContractName,"balanceOf",[props.poolAddress_hack],5000);
  const userBalance = useContractReader(readContracts,daiContractName,"balanceOf",[props.address],5000);

  let displayPoolBalance = poolBalance?ethers.utils.formatEther(poolBalance):"Loading...";
  let displayUserBalance = userBalance?ethers.utils.formatEther(userBalance):"Loading...";
  
  return (
    <div>
      Pool balance: {displayPoolBalance} DAI Your balance: {displayUserBalance} DAI . . .
      
      {props.address?(
        <Address value={props.address} ensProvider={props.mainnetProvider}/>
      ):"Connecting..."}
      <Balance address={props.address} provider={props.injectedProvider} dollarMultiplier={props.price}/>
      {modalButtons}
    </div>
  );
}
