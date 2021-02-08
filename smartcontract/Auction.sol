pragma solidity ^0.5;
pragma experimental ABIEncoderV2;

contract Auction  {

    struct AuctionData {
        uint start;
        uint upper;
        uint endTime;
        bool valid;
        address payable buyer;
        string name;
        bool lock;
    }

    struct Item{
        string name;
        bool valid;
    }

    struct User {
        string name;
        mapping (uint => Item) items;
        mapping (uint => AuctionData) auctions;
        uint itemcount;
        uint auctioncount;
    }

    mapping (address => User) users;
    mapping (string => address) items;
    mapping (string => bool) isAuctioning;
    address[] userslist;
    uint auctionedItemCount = 0;
    uint closedCount = 0;

    modifier onlyUser() {
        require(bytes(users[msg.sender].name).length != 0, "You must register first");
        _;
    }

    function registerItem(string memory name) public onlyUser {
        require(items[name] == address(0), "Already have that name");
        uint count = users[msg.sender].itemcount;
        users[msg.sender].items[count].valid = true;
        users[msg.sender].items[count].name = name;
        users[msg.sender].itemcount++;
        items[name] = msg.sender;
    }

    function registerName(string memory name) public {
        users[msg.sender].name = name;
        userslist.push(msg.sender);
    }

    function registerAuctionItem(string memory name, uint start_price, uint limit_price, uint date) public onlyUser{
        require(items[name] == msg.sender, "You can sell only your items");
        require(isAuctioning[name] == false, "It is already in the auction");
        AuctionData memory temp = AuctionData({start : start_price, upper : limit_price, endTime : date, valid : true, buyer:msg.sender,  name: name, lock:false});
        address owner = items[name];
        uint count = users[owner].auctioncount;
        users[owner].auctions[count] = temp;
        users[owner].auctioncount++;
        isAuctioning[name] = true;
        auctionedItemCount++;
    }

    function auctionBidding(string memory name) payable public onlyUser{
        uint count = 0;
        address owner = items[name];
        for(uint i = 0; i < users[owner].auctioncount; i++){
            if(keccak256(abi.encodePacked((name))) == keccak256(abi.encodePacked((users[owner].auctions[i].name))) && users[owner].auctions[i].valid == true){
                count = i;
                break;
            }
        }
        require(users[owner].auctions[count].lock == false, "Wait... it is locked");
        users[owner].auctions[count].lock = true;
        AuctionData memory target = users[owner].auctions[count];
        require(target.valid == true, "It is already ended");
        require(target.buyer != msg.sender, "Can not bid before other bid to item");
        require(target.start < msg.value, "It is less than now");
        require(target.upper >= msg.value, "Do not bid over than upper");
        if(target.buyer != owner){
            users[owner].auctions[count].buyer.transfer(target.start);
        }
        users[owner].auctions[count].buyer = msg.sender;
        users[owner].auctions[count].start = msg.value;
        if(target.upper == msg.value){
            auctionEnd(name);
        }
        users[owner].auctions[count].lock = false;
    }

    function auctionEnd(string memory name) public onlyUser{
        uint count = 0;
        uint countItem = 0;
        address owner = items[name];
        for(uint i = 0; i < users[owner].auctioncount; i++){
            if(keccak256(abi.encodePacked((name))) == keccak256(abi.encodePacked((users[owner].auctions[i].name))) && users[owner].auctions[i].valid == true){
                count = i;
                break;
            }
        }
        for(uint i = 0; i < users[owner].itemcount; i++){
            if(keccak256(abi.encodePacked((name))) == keccak256(abi.encodePacked((users[owner].items[i].name))) && users[owner].items[i].valid == true){
                countItem = i;
                break;
            }
        }
        AuctionData memory target = users[owner].auctions[count];
        require(target.start == target.upper || now >= target.endTime, "Condition is not fulfuill");
        require(target.valid == true, "It is already ended");
        users[owner].auctions[count].valid = false;
        uint counttemp = users[target.buyer].itemcount;
        users[target.buyer].items[counttemp].valid = true;
        users[owner].items[countItem].valid = false;
        users[target.buyer].items[counttemp].name = name;
        users[target.buyer].itemcount++;
        items[name] = target.buyer;
        isAuctioning[name] = false;
        if(target.buyer != owner){
            address payable wallet = address(uint160(owner));
            wallet.transfer(target.start);
        }
        closedCount++;
    }
    
    function changeItemOwner(string memory name) public onlyUser{
        require(items[name] == address(0), "Already have that name");
    }

    function getMyItems() public view returns(string[] memory) {
        uint count = users[msg.sender].itemcount;
        string[] memory mine = new string[](count);
        uint j = 0;
        for (uint i = 0; i < count; i++) {
            if(users[msg.sender].items[i].valid == true) {
                mine[j] = users[msg.sender].items[i].name;
                j++;
            }
        }
        return mine;
    }


    function getName() public view returns(string memory) {
        return users[msg.sender].name;
    }

    function getAllRegisteredItems() public view returns(string[] memory, string[] memory, uint[] memory, uint[] memory, uint[] memory) {
        string[] memory itemName = new string[](auctionedItemCount);
        string[] memory ownerName = new string[](auctionedItemCount);
        uint[] memory bidPrice = new uint[](auctionedItemCount);
        uint[] memory upperPrice = new uint[](auctionedItemCount);
        uint[] memory dueDate = new uint[](auctionedItemCount);
        uint k = 0;
        for(uint i = 0; i < userslist.length; i++) {
            uint count = users[userslist[i]].auctioncount;
            for(uint j = 0; j < count; j++){ 
                if(users[userslist[i]].auctions[j].valid == true){
                    itemName[k] = users[userslist[i]].auctions[j].name;
                    ownerName[k] = users[userslist[i]].name;
                    bidPrice[k] = users[userslist[i]].auctions[j].start;
                    upperPrice[k] = users[userslist[i]].auctions[j].upper;
                    dueDate[k] = users[userslist[i]].auctions[j].endTime;
                    k++;
                }
            }
        }
        return (itemName, ownerName, bidPrice, upperPrice, dueDate);
    }

    function getAllAuctionedItems() public view returns(string[] memory, string[] memory, uint[] memory) {
        string[] memory itemName = new string[](closedCount);
        string[] memory ownerName = new string[](closedCount);
        uint[] memory winningPrice = new uint[](closedCount);
        uint k = 0;
        for(uint i = 0; i < userslist.length; i++) {
            uint count = users[userslist[i]].auctioncount;
            for(uint j = 0; j < count; j++){ 
                if(users[userslist[i]].auctions[j].valid == false){
                    itemName[k] = users[userslist[i]].auctions[j].name;
                    ownerName[k] = users[users[userslist[i]].auctions[j].buyer].name;
                    winningPrice[k] = users[userslist[i]].auctions[j].start;
                    k++;
                }
            }
        }
        return (itemName, ownerName, winningPrice);
    }
}