import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import contractSpec from '../../dapp/artifacts/contracts/Feed.sol/Feed.json'
import './App.css'

export default function App() {
  const [wallet, setWallet] = useState('')
  const [message, setMessage] = useState('')
  const [winners, setWinners] = useState(0)
  const [nominees, setNominees] = useState(0)
  const [messages, setMessages] = useState([])

  const contractABI = contractSpec.abi
  const contractAddr = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

  const getEthereumAPI = () => {
    const { ethereum } = window
    if (!ethereum) throw 'Make sure you have metamask'
    return ethereum
  }

  const getContractAPI = () => {
    const ethereum = getEthereumAPI()
    const provider = new ethers.providers.Web3Provider(ethereum)
    const contract = new ethers.Contract(contractAddr, contractABI, provider.getSigner())
    return contract
  }

  const sendMessage = async () => {
    if (!message) return

    const contract = getContractAPI()
    const tx = await contract.sendMessage(message, { gasLimit: 300000 })
    await tx.wait()
    
    setMessage('')
  }

  const checkWalletConnected = async () => {
    const ethereum = getEthereumAPI()
    const accounts = await ethereum.request({
      method: 'eth_accounts'
    })

    if (!accounts.length) {
      console.log('No authorized accounts found')
      return
    }

    const account = accounts[0]
    console.log('Found authorized account:', account)
    setWallet(account)
  }

  const connectWallet = async () => {
    const ethereum = getEthereumAPI()
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    })

    const account = accounts[0]
    console.log('Found authorized account:', account)
    setWallet(account)
  }

  const handleMessageSent = (from, timestamp, content) => {
    setMessages(prevState => [
      ...prevState, {
        sender: from,
        content: content,
        timestamp: new Date(timestamp * 1000).toLocaleString(),
      }
    ])
  }

  const handleNewWinnerArrived = () => {
    setWinners(winners + 1)
  }

  const handleNewNomineeArrived = () => {
    setNominees(nominees + 1)
  }

  useEffect(() => {
    checkWalletConnected()

    const contract = getContractAPI()
    contract.on('MessageSent', handleMessageSent)
    contract.on('NewWinnerArrived', handleNewWinnerArrived)
    contract.on('NewNomineeArrived', handleNewNomineeArrived)

    return () => {
      if (contract) {
        contract.off('MessageSent', handleMessageSent)
        contract.off('NewWinnerArrived', handleNewWinnerArrived)
        contract.off('NewNomineeArrived', handleNewNomineeArrived)
      }
    }
  }, [])

  const renderAuth = () => (
    <div className='intro'>
      <h1 className='intro-title'>Welcome to the <b>Feed 🦄</b></h1>
      <h2 className='intro-subtitle'>Connect your wallet to get started</h2>
      <button className='intro-button' onClick={connectWallet}>Connect me 🤷‍♂️</button>
    </div>
  )

  const renderApp = () => (
    <div className='feed-app'>
      <div className='profile'>
        <span>Your wallet: <b>{wallet}</b></span>
      </div>
      <div className='sendbox'>
        <textarea className='sendbox-input' value={message} onChange={({ target }) => setMessage(target.value)}/>
        <button className='sendbox-button' onClick={sendMessage}>Send message</button>
      </div>
      <div className='feed'>
        <div className='feed-header'>
          <span className='feed-winners'>Winners: <b>{winners}</b></span>
          <span className='feed-nominees'>Nominees: <b>{nominees}</b></span>
          <span className='feed-messages'>Messages: <b>{messages.length}</b></span>
        </div>
        <div className='feed-content'>
          {messages.length > 0 && messages.map((message, idx) => (
            <div className='message' key={idx}>
              <div className='message-header'>
                <span className='message-sender'>From: <b>{message.sender}</b></span>
                <span className='message-timestamp'>At: <b>{message.timestamp}</b></span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className='app'>
      {!wallet ? renderAuth() : renderApp()}
    </div>
  )
}
