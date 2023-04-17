// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SafeVote
 * @dev A voting contract that allows members to vote on proposals
 *      Proposals can be added by the president
 *      Members can be added and removed by the secretary
 *      Members can vote on proposals
 *      Members can only vote once per proposal
 *      Proposals can only be voted on for a specified duration
 **/
contract SafeVote is AccessControl {
    // Define a role for addresses that can add proposals
    bytes32 public PRESIDENT_ROLE = keccak256("PRESIDENT");
    // Define a role for addresses that can add/remove members
    bytes32 public SECRETARY_ROLE = keccak256("SECRETARY");
    // Define a role for addresses that can vote
    bytes32 public MEMBER_ROLE = keccak256("MEMBER");

    struct Proposal {
        string title;
        uint32 id;
        uint32 yesCounter;
        uint32 noCounter;
        uint32 neutralCounter;
        uint128 endTimestamp;
    }

    Proposal[] public proposals;

    // Mapping to track user votes for a specific proposal
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /**
     * @dev Constructor
     * @param _admin Address of the admin
     * @param _secretary Address of the secretary
     **/
    constructor(address _admin, address _secretary) {
        _setupRole(PRESIDENT_ROLE, _admin);
        _setupRole(SECRETARY_ROLE, _secretary);
    }

    /**
     * @dev Add a new member to the MEMBER_ROLE
     * @param _member Address of the member to be added
     **/
    function addMember(address _member) external onlyRole(SECRETARY_ROLE) {
        _grantRole(MEMBER_ROLE, _member);
    }

    /**
     * @dev Remove a member from the MEMBER_ROLE
     * @param _member Address of the member to be removed
     **/
    function removeMember(address _member) external onlyRole(SECRETARY_ROLE) {
        _revokeRole(MEMBER_ROLE, _member);
    }

    /**
     * @dev Add a new proposal for voting
     * @param _title The title of the proposal
     * @param _duration The duration of the voting in minutes
     **/
    function addProposal(
        string memory _title,
        uint256 _duration
    ) external onlyRole(PRESIDENT_ROLE) {
        proposals.push(
            Proposal(
                _title,
                uint32(proposals.length),
                0,
                0,
                0,
                uint128(block.timestamp + _duration * 1 minutes)
            )
        );
    }

    /**
     * @dev Vote for a proposal
     * @param _id The ID of the proposal
     * @param _vote The vote (0 for yes, 1 for no, 2 for neutral)
     **/
    function vote(uint256 _id, uint256 _vote) external onlyRole(MEMBER_ROLE) {
        require(
            proposals[_id].endTimestamp > block.timestamp,
            "Voting is over"
        );
        require(!hasVoted[_id][msg.sender], "Already voted");

        if (_vote == 0) {
            proposals[_id].yesCounter++;
        } else if (_vote == 1) {
            proposals[_id].noCounter++;
        } else if (_vote == 2) {
            proposals[_id].neutralCounter++;
        }

        // Record that the user has voted for this proposal
        hasVoted[_id][msg.sender] = true;
    }

    /**
     * @dev Get the results of a proposal
     * @param _id The ID of the proposal
     * @return (uint32, uint32, uint32) The number of yes, no, and neutral votes
    **/
    function getResults(
        uint256 _id
    ) external view returns (uint32, uint32, uint32) {
        return (
        proposals[_id].yesCounter,
        proposals[_id].noCounter,
        proposals[_id].neutralCounter
        );
    }
}
