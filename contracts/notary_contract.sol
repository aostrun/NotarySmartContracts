pragma solidity ^0.4.21;

/*
    Author:         Andrijan Ostrun
    Date:           14.4.2018.
    Description:    Notary Smart Conract implemented as an entry
                    to the "Around the Block" Workshop hackhaton.

*/

contract Notary{
    
    mapping( uint256 => Record ) records;
    
    uint256 currentId;
    
    struct Record{
        uint256 hash;
        // Indicate which address is party on this record
        address party1;
        address party2;
        
        bool party1_ack;
        bool party2_ack;
        //mapping( address => bool ) parties;
        // Store acknowledgment of this record by the party
        //mapping( address => bool ) allowance;
        // Store the timestamp of record creation
        uint256 createdAt;
        // Record is valid if now < validUntil
        uint256 validUntil;
        // Guard against bruteforce attacks
		uint256 lastFailedTest;
        
    }
    
    event NewRecordCreated(uint256 recordId);
    event Verified();

    
    /*
        Allows access to the record only to party registered to the record
    */
    modifier onlyParty(uint256 recordId){
        //require(records[recordId].parties[msg.sender] == true);
        _;
    }
    
    /*
        Only valid records can be accesed
    */
    modifier onlyValid(uint256 recordId){
        require(records[recordId].validUntil < now);
        _;
    }
    
    
    /*
        Constructor
    */
    function Notary() public{
        currentId = 0;
    }
    
    /*
        Create new record and add parties associated with this record and set its validity time
    */
    function createRecord(uint256 hash, address[] _parties, uint256 validUntil)
        external
        returns (uint256 newRecordId)
    {	
		newRecordId = currentId++;
		// Limit max number of parties to 10
		require(_parties.length == 2);
		
        // Create new record
        Record newRecord; // = Record(0, new address[](0), new address[](0), 0, 0, 0);
        newRecord.hash = hash;
		newRecord.validUntil = validUntil;
		
        // Add parties and init values to true
        /*
        // indicating that address is party on this record
        for(uint8 i = 0; i < _parties.length; i++){
			newRecord.parties.push(_parties[i]);
		}
		*/
		newRecord.party1 = _parties[0];
		newRecord.party2 = _parties[1];
		
        // Save the record
        records[newRecordId] = newRecord;
        //uint256 returnId = currentId;
        emit NewRecordCreated(newRecordId);
        // Increment the pointer
        
    }
    
    function acceptRecord(uint256 recordId)
        external
    {   
        require(validParty(recordId, msg.sender) == true);
        require(records[recordId].validUntil >= now);
        
        if(msg.sender == records[recordId].party1){
            records[recordId].party1_ack = true;
        }else{
            records[recordId].party2_ack = true;
        }
        
        //records[recordId].allowances.push(msg.sender);
        
    }
    
    function validParty(uint256 recordId, address party)
        constant
        returns (bool)
    {   
        if(party == records[recordId].party1 || party == records[recordId].party2){
            return true;
        }
        return false;
        /*
        for(uint8 i = 0; i < records[recordId].parties.length; i++){
            if(records[recordId].parties[i] == party){
                return true;
            }
        }
        return false;
        */
    }
    
    // Return the record hash 
    function getRecord(uint256 recordId) 
        external 
        constant
        returns (uint256, address, uint256)
    {
        return (records[recordId].hash, records[recordId].party1, records[recordId].validUntil);
    }
    
    
	// Checks if the given hash matches recorded hash
    function verify(uint256 recordId, uint256 test_hash)
        external
        returns (bool)
    {	
		/* 
			Prevent bruteforce attacks, after every failed test
			wait 30s before testing again.
		*/
		require(records[recordId].lastFailedTest + 30 seconds < now);
        if(test_hash == records[recordId].hash){
            emit Verified();
            return true;
        }else{
			records[recordId].lastFailedTest = now;
            return false;
        }
        
    }
    
    
}