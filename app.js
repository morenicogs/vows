// DOM Elements
const connectButton = document.getElementById("connectButton");
connectButton.addEventListener("click", connect)
const connectedAddress = document.getElementById("connectedAddress");

const proposeDiv = document.getElementById("proposeDiv");
const proposeCollapse = document.getElementById("proposeCollapse");
const proposedToSpan = document.getElementById("proposedToSpan");
const proposeForm = document.getElementById("proposeForm");
const proposeFieldset = document.getElementById("proposeFieldset");
const proposeInput = document.getElementById("proposeInput");
const proposeUrlInput = document.getElementById("proposeUrlInput");
const proposeButton = document.getElementById("proposeButton");
proposeForm.addEventListener("submit", (event) => {
	event.preventDefault();
	propose();
})
const proposeUrlButton = document.getElementById("proposeUrlButton");
proposeUrlButton.addEventListener("click", copytoCipbord)


const acceptDiv = document.getElementById("acceptDiv");
const acceptForm = document.getElementById("acceptForm");
const acceptFieldset = document.getElementById("acceptFieldset");
const acceptInput = document.getElementById("acceptInput");
const acceptButton = document.getElementById("acceptButton");
acceptForm.addEventListener("submit", (event) => {
	event.preventDefault();
	accept();
})

const marriageInfo = document.getElementById("marriageInfo");
const annulButton = document.getElementById("annulButton");
annulButton.addEventListener("click", annul)

// Global Variables
let account = "";
let contract;
let marriageIndex;
let marriageMetadata;

// 
// Check wallet connection
// 		If connected:
// 			Check Marriages
// 				If married
// 					Enable annul marriage
//					Fill in ProposeInput & AcceptInput with marriage details
// 					Show Current Mariage NFT
// 				If not married
// 					Enable Propose & Accept forms
// 					


async function connect(){
	if(window.ethereum){
		await window.ethereum.send("eth_requestAccounts");
		window.web3 = new Web3(window.ethereum);


		// Check current active chain
		const currentChainId  = await web3.eth.getChainId();

		// Change chain if not Goerli
		if(currentChainId != 1) {
			await window.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x1" }] // number 5 in hex is 0x5
			});
		}

		let accounts = await web3.eth.getAccounts();
		account = accounts[0];

		// Change DOM 
		connectButton.classList.add("invisible");
		showConnectedAddress();
		isMarried();
		hasProposed();
		
		
	} else {
		alert("Metamask not detected");
	}
}

// *******************
// * MAIN FUNCTIONS
// *******************
async function propose(){
	await connect();
	// if(!isMarried){
		contract = new web3.eth.Contract(vowsABI, vowsContract)
		contract.methods.propose(proposeInput.value).send({from: account})
	// }

	showProposeCollapse(proposeInput.value)
}

async function accept(){
	await connect();
	// if(!isMarried){
		contract = new web3.eth.Contract(vowsABI, vowsContract)
		contract.methods.accept(acceptInput.value).send({from: account}, (err, result) => {
			console.log(result, err);
		})
	// }
}

async function annul(){
	await connect();
	// if(isMarried){
		contract = new web3.eth.Contract(vowsABI, vowsContract)
		contract.methods.annul().send({from: account}, (err, result) => {
			console.log(result, err);
		})
	// }
}



function showConnectedAddress(){
	connectedAddress.textContent = "Connected as: " + account;
}

// *******************
// * PROPOSE STUFF
// *******************

function enableProposals(){
	proposeFieldset.removeAttribute("disabled")
	acceptFieldset.removeAttribute("disabled")
}

function showProposeCollapse(address){
	proposeCollapse.classList.add("show");
	proposedToSpan.innerText = address
	proposeUrlInput.value = "http://127.0.0.1:5500/?sayYesTo=" + account;
}

async function getProposal(address){
	contract = new web3.eth.Contract(vowsABI, vowsContract);
	const proposedTo = await contract.methods.proposals(address).call()
	return proposedTo
}

async function hasProposed(){
	const proposedTo = await getProposal(account);
	if(proposedTo === "0x0000000000000000000000000000000000000000"){
		console.log("Has not yet proposed to someone")	
	} else {
		console.log("Has already proposed")
		showProposeCollapse(proposedTo);
	}
}

// *******************
// * ACCEPT STUFF
// *******************
async function hasRecievedProposal(address){
	await connect();
	const proposedTo = await getProposal(address);
	if(proposedTo == account){
		return true
	} else {
		return false
	}
}

async function checkUrlParams(){
// If URL contzins SayYesTo
// 	remove Propose function
	if(sayYesTo){
		proposeDiv.remove();
		acceptInput.value = sayYesTo;
		}
		
	}

// *******************
// * MARRIAGR STUFF
// *******************

async function isMarried() {
	contract = new web3.eth.Contract(vowsABI, vowsContract)
	const balance = Number(await contract.methods.balanceOf(account).call())
	
	if(balance){
		console.log("Address is Married!");
		enableAnnulment()
		return true;
	} else {
		console.log("Address is not married (yet?)!")
		enableProposals();
		return false;
	}
}

async function showMarriage(address){
	await getMarriage(address)
	
	const image = document.createElement("img");
	image.setAttribute("src", marriageMetadata.image)
	image.setAttribute("style", "max-width: 420px;")
	marriageInfo.appendChild(image);
	
	
	
}

function enableAnnulment(){
	annulButton.setAttribute("class","btn w-100 btn-primary")
	proposeDiv.remove()
	acceptDiv.remove();
	showMarriage(account);
	
}



async function getMarriage(address) {
	contract = new web3.eth.Contract(vowsABI, vowsContract)
	// Get total Supply
	const totalSupply = await contract.methods.totalSupply().call();

	// Try getting metadata for every index
	for (let i = 0; i < totalSupply - 1; i++) {
		try{
			marriageIndex = i
			await getMetadata(address, marriageIndex)
		} catch(error) {
			marriageIndex = i - 1
		}
		
	}
}

async function getMetadata(address, marriageIndex){
	
	contract = new web3.eth.Contract(vowsABI, vowsContract)
	// First get the token ID for the marriage index
	const tokenId = await contract.methods.tokenOfOwnerByIndex(address, marriageIndex).call();
	const tokenURI = await contract.methods.tokenURI(tokenId).call()
	
	const [, base64] = tokenURI.split(",");
	const metadata = atob(base64);
	marriageMetadata = JSON.parse(metadata);
}


function copytoCipbord() {
	proposeUrlInput.select();
	proposeUrlInput.setSelectionRange(0, proposeUrlInput.value.length);

	navigator.clipboard.writeText(proposeUrlInput.value);

}

checkUrlParams()