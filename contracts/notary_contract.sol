pragma solidity ^0.4.21;

contract Notary{
    
    mapping( uint256 => Record ) records;
    
    uint256 currentId = 0;
    
    struct Record{
        uint256 hash;
        // Indicate which address is party on this record
        mapping( address => bool ) parties;
        // Store acknowledgment of this record by the party
        mapping( address => bool ) allowance;
        // Store the timestamp of record creation
        uint256 createdAt;
        // Record is valid if now < validUntil
        uint256 validUntil;
        // Guard against bruteforce attacks
		uint256 lastFailedTest;
        
    }
    
    event NewRecordCreated(uint256 recordId);
    
    /*
        Allows access to the record only to party registered to the record
    */
    modifier onlyParty(uint256 recordId){
        require(records[recordId].parties[msg.sender] == true);
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
        
    }
    
    /*
        Create new record and add parties associated with this record and set its validity time
    */
    function createRecord(uint256 hash, address[] _parties, uint256 validUntil)
        external
        returns (uint256)
    {	
		
		// Limit max number of parties to 10
		require(_parties.length <= 10);
		
        // Create new record
        Record newRecord;
        newRecord.hash = hash;
		newRecord.validUntil = validUntil;
		
        // Add parties and init values to true
        // indicating that address is party on this record
        for(uint8 i = 0; i < _parties.length; i++){
			newRecord.parties[_parties[i]] = true;
		}
		
        // Save the record
        records[currentId] = newRecord;
        uint256 returnId = currentId;
        // Increment the pointer
        currentId++;
        emit NewRecordCreated(returnId);
        return (returnId);
    }
    
    function acceptRecord(uint256 recordId)
        external
    {   
        require(records[recordId].parties[msg.sender] == true);
        require(records[recordId].validUntil >= now);
        
        records[recordId].allowance[msg.sender] = true;
        
    }
    
    
    // Return the record hash 
    function getRecord(uint256 recordId) 
        external 
        constant
        returns (uint256)
    {
        return (records[recordId].hash);
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
            return true;
        }else{
			records[recordId].lastFailedTest = now;
            return false;
        }
        
    }
    
    
}