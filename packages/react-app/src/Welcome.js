import React, { useState, useEffect, useRef } from 'react'
import { ethers } from "ethers";
import Blockies from 'react-blockies';
import { Typography, Skeleton, Card, Row, Col, Button, List } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useContractLoader, useContractReader, useEventListener, useBlockNumber, useBalance } from "./hooks"
import { Transactor } from "./helpers"
import { Address, Balance, Timeline } from "./components"
const { Title } = Typography;
const { Meta } = Card;

const upalaContractName = "Upala"

export default function Welcome(props) {

  const tx = Transactor(props.injectedProvider,props.gasPrice)
  const readContracts = useContractLoader(props.localProvider);
  const writeContracts = useContractLoader(props.injectedProvider);


  // const savedMsgSender =  useContractReader(readContracts,upalaContractName,"savedMsgSender",1777);
  // console.log("savedMsgSender", savedMsgSender);

  const contractLoaded = readContracts && readContracts[upalaContractName];
  if (contractLoaded) {
    console.log("readContracts[contractName].address", readContracts[upalaContractName].address);
  }

  return (
    <div>

      <a onClick={()=>{
              tx(
                writeContracts[upalaContractName]
                  .newIdentity(props.address, { gasLimit: ethers.utils.hexlify(400000) })
                )
            }}>New Identity</a> <br />

      <a onClick={()=>{
              readContracts[upalaContractName].myId({ from: props.address }).then((result) => {
                console.log("myId button result", result.toNumber());
              });
            }}>My Id</a>

    </div>
  );

}
