const hre = require('hardhat')

async function main() {
  await hre.run('compile')

  const factory = await hre.ethers.getContractFactory('Feed')
  const contract = await factory.deploy({ value: hre.ethers.utils.parseEther('1000') })
  await contract.deployed()

  console.log('Feed contract has been deployed!')
  console.log(`contract address: ${contract.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })