import { patract, network } from 'redspot'
const fs = require('fs')

const { getContractFactory } = patract
const { createSigner, keyring, api } = network

async function run() {
  await api.isReady

  const signer = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' // Alice Address
  const receiver = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' // Bob Address

  const contractFactory = await getContractFactory('erc20', signer)

  const balance = await api.query.system.account(signer)

  console.log('Balance: ', balance.toHuman())

  const contract = await contractFactory.deploy('new', '1000000', {
    gasLimit: '400000000000',
    value: '1000 UNIT',
  })

  console.log('')
  console.log('The contract address: ', contract.address.toString())

  // const balanceOfAlice = await contract.query.balanceOf(signer)
  // console.log('Balance of Alice: ', balanceOfAlice.output?.toHuman())

  // await contract.tx.transfer(receiver, 10000)

  // const balanceOfBob = await contract.query.balanceOf(receiver)
  // console.log('Balance of Bob: ', balanceOfBob.output?.toHuman())

  api.disconnect()

  // Export deployed contract address for the FE-interface
  fs.writeFileSync('artifacts/contract.address.js', 'export const DEPLOYED_ADDRESS = "' + contract.address.toString() + '"')
}

run().catch((err) => {
  console.log(err)
})
