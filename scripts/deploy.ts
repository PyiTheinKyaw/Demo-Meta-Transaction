// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);

  const initsupply = 10000000;

  const Receiver = await ethers.getContractFactory('Receiver');
  const receiver = await Receiver.deploy();

  await receiver.deployed();
  console.log("Receiver deployed to:", receiver.address);

  const TargetContractA = await ethers.getContractFactory("TargetContractA");
  const tca = await TargetContractA.deploy(initsupply, receiver.address);

  await tca.deployed();
  console.log("TargetContractA deployed to:", tca.address);

  const TargetContractB = await ethers.getContractFactory("TargetContractB");
  const tcb = await TargetContractB.deploy(initsupply, receiver.address);

  await tcb.deployed();
  console.log("TargetContractB deployed to:", tcb.address);

  const TargetContractC = await ethers.getContractFactory("TargetContractC");
  const tcc = await TargetContractC.deploy(initsupply, receiver.address);

  await tcc.deployed();
  console.log("TargetContractC deployed to:", tcc.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
