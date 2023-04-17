import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { SafeVote } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

let safeVote: SafeVote;

let ownerAccount: SignerWithAddress;
let president: SignerWithAddress;
let secretary: SignerWithAddress;
let member1: SignerWithAddress;
let member2: SignerWithAddress;
let member3: SignerWithAddress;
let randomUser: SignerWithAddress;

describe("SafeVote", function () {
  async function deploySafeVoteFixture() {

    [
      ownerAccount,
      president,
      secretary,
      member1,
      member2,
      member3,
      randomUser,
    ] = await ethers.getSigners();
    const SafeVote = await ethers.getContractFactory("SafeVote");
    const safeVote = await SafeVote.deploy(president.address, secretary.address)

    return safeVote;
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
        safeVote = await loadFixture(deploySafeVoteFixture);
    });
  });

  describe("Vote", function () {
    describe("Admin", function () {
      it("non-Admin should NOT add a new proposal", async function () {
        await expect(safeVote.connect(secretary).addProposal("Proposal 1", 3)).to.be.reverted;
      });
      it("Admin should add a new proposal", async function () {
        await safeVote.connect(president).addProposal("Proposal 1", 3);
      });
    });
    describe("Secretary", function () {
      it("non-secretary should NOT add a new member", async function () {
        await expect(safeVote.connect(randomUser).addMember(member1.address)).to.be.reverted;
      });
      it("Secretary should add a new proposal", async function () {
        await safeVote.connect(secretary).addMember(member1.address);
        await safeVote.connect(secretary).addMember(member2.address);
        await safeVote.connect(secretary).addMember(member3.address);

        const MEMBER_ROLE = await safeVote.MEMBER_ROLE();

        expect(await safeVote.hasRole(MEMBER_ROLE, member1.address)).to.be.true;
        expect(await safeVote.hasRole(MEMBER_ROLE, member2.address)).to.be.true;
        expect(await safeVote.hasRole(MEMBER_ROLE, member3.address)).to.be.true;
      });
    });
    describe("Member", function () {
      it("not-member should NOT be able to vote", async function () {
        await expect(safeVote.connect(randomUser).vote(0, 1)).to.reverted;
      });
      it("member should be able to vote", async function () {
        await safeVote.connect(member1).vote(0, 1);

        const result = await safeVote.getResults(0);

        expect(result[1]).to.equal(1);
      });
      it("member should be able to vote", async function () {
        await expect(safeVote.connect(member1).vote(0, 1)).to.revertedWith("Already voted");
      });
    });
  });
});
