var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));

const contract_address = "0xE838b1A0d54ef3CfE4436d3e797F87c5c12CFBDC";
const abi =[
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "auctionBidding",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "auctionEnd",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "changeItemOwner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "start_price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "limit_price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "date",
				"type": "uint256"
			}
		],
		"name": "registerAuctionItem",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "registerItem",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "registerName",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getAllAuctionedItems",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getAllRegisteredItems",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getMyItems",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getName",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];
//let auction = new web3.eth.Contract(abi, contract_address);

let contract = new web3.eth.Contract(abi, contract_address);

$(document).ready(function() {
	startDapp();
	$('form').submit(function(event) {
		var formId = this.id,
			form = this;
		event.preventDefault();
		setTimeout( function () { 
			form.submit();
		}, 1000);
	}); 
})

var startDapp = async function() {
	getMyItems();
	getRegisteredAuctionItems();
	getClosedAuctionItems();
	getMyItemsToBeAuctioned();
	getItemsRegisteredAtAuction();
	getName();
}


var getBalance = function() {
	var address = $('#address').text();
	web3.eth.getBalance(address, function (error, balance) {
		if (!error)
			$('#balanceAmount').text(web3.utils.fromWei(balance,'ether'));
		else
			console.log('error: ', error);
	});
}

var getName = async function() {
	var address = $('#address').text();
	var name = await contract.methods.getName().call({from:address});
	$('#name').text(name);
}

var registerName = async function() {
	var address = $('#address').text();
	var name = $('#change_name').val();
	await contract.methods.registerName(name).send({from:address, gas:6721975});
}

var registerForMyItem = async function() {
	var address = $('#address').text();
	var name = $('#Item').val();
	await contract.methods.registerItem(name).send({from:address, gas:6721975});
}

var registerAuctionItem = async function() {
	var address = $('#address').text();
	var name = $("#myitems-category option:selected").val();
	var start_price = Number($('#startingBidPrice').val()) * Math.pow(10, 18);
	var limit_price = Number($('#upperLimitPrice').val()) * Math.pow(10, 18);
	
	var due = Math.round(new Date($('#dueDate').val()).getTime()/1000);
	await contract.methods.registerAuctionItem(name, start_price.toString(), limit_price.toString(),due.toString()).send({from:address, gas:6721975});
}

var auctionBidding = async function() {
	var address = $('#address').text();
	var word = $("#auction-category option:selected").val();
	var tmp = word.split(',');
	var value = Number($('#bidPrice').val());
	await contract.methods.auctionBidding(tmp[0]).send({from:address, gas:6721975, value:value*Math.pow(10, 18)});
}

var getMyItems = async function() {
	var address = $('#address').text();
	var array = await contract.methods.getMyItems().call({from:address});
	for (var i in array) {
		if (array[i] !== "")
			$('#myItems').append('<tr><td>'+ array[i] +'</td></tr>');
	}
}

var getRegisteredAuctionItems = async function() {
	var address = $('#address').text();
	var array = await contract.methods.getAllRegisteredItems().call({from:address});
	for (var i in array['0']){
		if(array['0'][i] !== ""){
			var date = new Date(array['4'][i] * 1000);
			console.log(Date.now()/1000 , Number(array['4'][i]));
			if((Date.now()/1000) > Number(array['4'][i])){
				console.log("aa");
				await contract.methods.auctionEnd(array['0'][i]).send({from:address, gas:6721975});
			}
			else{
				var text = "<tr><td>" + array['0'][i]
				+"</td><td>" + array['1'][i]
				+"</td><td>" + (Number(array['2'][i])/Math.pow(10,18)).toString() + "ETH"
				+"</td><td>" + (Number(array['3'][i])/Math.pow(10,18)).toString() + "ETH"
				+"</td><td>" + date.toString()
				+"</td></tr>";
				$('#registeredCars').append(text);
			}
		}
	} 
}

var getClosedAuctionItems = async function() {
	var address = $('#address').text();
	var array = await contract.methods.getAllAuctionedItems().call({from:address});
	for (var i in array['0']){
		if(array['0'][i] !== ""){
			var text = "<tr><td>" + array['0'][i]
			+"</td><td>" + array['1'][i]
			+"</td><td>" + (Number(array['2'][i]) / Math.pow(10,18)).toString() + "ETH"
			+"</td></tr>";
			$('#carsOnSale').append(text);
		}
	} 
}

var getMyItemsToBeAuctioned = async function() {
	var address = $('#address').text();
	var array = await contract.methods.getMyItems().call({from:address});
	var alreadyAuctioned = await contract.methods.getAllRegisteredItems().call({from:address});
	var result = [];
	for (var i in array){
		if (!alreadyAuctioned['0'].includes(array[i]) && array[i] !== ""){
			result.push(array[i]);
		}
	}
	for (var i in result) {
		$("#myitems-category").append(new Option(result[i], result[i]));
	}
}
var getItemsRegisteredAtAuction = async function() {
	var address = $('#address').text();
	var arraymine = await contract.methods.getMyItems().call({from:address});
	var array = await contract.methods.getAllRegisteredItems().call({from:address});
	var result = [];
	for (var i in array['0']){
		if (!arraymine.includes(array['0'][i]) && array['0'][i] !== undefined && array['0'][i] !== ""){
			result.push([array['0'][i], array['1'][i]]);
		}
	}
	console.log(result);
	for (var i in result){
		$("#auction-category").append(new Option(result[i][0], [result[i][0],result[i][1]]));
	} 
}

