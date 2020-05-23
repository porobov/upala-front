import React from 'react';
import { membership_status, upalaContractName } from "../config";
import { ethers } from "ethers";
import { useContractLoader, useContractReader, useEventListener, useBlockNumber, useBalance } from "../hooks"
import { Transactor } from "../helpers"

export default function Details(props) {

  const activeGroupID = props.activeGroupID;
  const loadedGroups=props.loadedGroups;
  const setLoadedGroups = props.setLoadedGroups;
  const userUpalaId = props.userUpalaId;

  // Blockchain interaction
  const tx = Transactor(props.injectedProvider,props.gasPrice)
  const readContracts = useContractLoader(props.localProvider);
  const writeContracts = useContractLoader(props.injectedProvider);
  
  function joinGroup(groupID) {
    let newGroups = loadedGroups;
    if (typeof newGroups[groupID] !== 'undefined' 
          && 
        typeof newGroups[groupID].membership_status !== 'undefined') {
          setLoadedGroups((loadedGroups) => {
            let newGroups = Object.assign({}, loadedGroups);
            newGroups[groupID].membership_status = membership_status.PENDING_JOIN;
            return newGroups;})
          }
    if (newGroups[groupID].manager_address != "0x0") {
      console.log("writeContracts[loadedGroups");
      tx(
        writeContracts[loadedGroups[activeGroupID].title].
          join(userUpalaId, { gasLimit: ethers.utils.hexlify(400000) })
        )
    }
  }

  function explode(groupID) {
    let newGroups = loadedGroups;
    if (typeof newGroups[groupID] !== 'undefined' 
          && 
        typeof newGroups[groupID].membership_status !== 'undefined') {
          setLoadedGroups((loadedGroups) => {
            let newGroups = Object.assign({}, loadedGroups);
            newGroups[groupID].membership_status = membership_status.NO_MEMBERSHIP;
            return newGroups;})
          }
    if (newGroups[groupID].manager_address != "0x0") {
      console.log("EXPLODE", newGroups[groupID].path);
      tx(
        writeContracts[upalaContractName].
          attack(newGroups[groupID].path, { gasLimit: ethers.utils.hexlify(400000) })
        )
    }
  }


  if (activeGroupID) {
    console.log("activeGroupID", activeGroupID);
    return (
      <div>
        <h2>{loadedGroups[activeGroupID].title}</h2>
        <b>groupID:</b> {loadedGroups[activeGroupID].groupID} <br />
        <b>membership_status:</b> {loadedGroups[activeGroupID].membership_status} <br />
        <b>details:</b> {loadedGroups[activeGroupID].details} <br />
        <b>manager_address:</b> {loadedGroups[activeGroupID].manager_address} <br />
        <a onClick={() => joinGroup(activeGroupID)}>Join</a> <br />
        <a onClick={() => explode(activeGroupID)}>EXPLODE</a> <br />
      </div>

    )
  } else {
    return null
  }
}
