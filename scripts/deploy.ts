import { ethers, network } from "hardhat";
import { verify } from "./utils/verify";

async function main() {
    const SafeVote = await ethers.getContractFactory("SafeVote");
    const safeVote = await SafeVote.deploy("0x", "0x");
    await safeVote.deployed();

    console.log(`Deployed SafeVote to ${safeVote.address}`);

    if (network.name !== "hardhat") {
        console.log("Verifying the smart contracts....");
        await safeVote.deployTransaction.wait(5);
        await verify(safeVote.address, []);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
