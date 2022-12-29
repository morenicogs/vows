// Dom Elements
const marriagesDiv = document.getElementById("marriages");
const mostRecentBtn = document.getElementById("mostRecent");
const oldestBtn = document.getElementById("oldest");

mostRecentBtn.addEventListener("click", (event) => {
	marriagesOrder = event.target.id
	mostRecentBtn.checked = true;
	oldestBtn.checked = false;
	renderMarriages()
})
oldestBtn.addEventListener("click", (event) => {
	marriagesOrder = event.target.id
	mostRecentBtn.checked = false;
	oldestBtn.checked = true;
	renderMarriages()
})

let account = "";
let contract;
// let marriageIndex;
let marriageMetadata = [];
let totalSupply;
let marriagesData = [];
let marriagesOrder = "mostRecent";

async function connect(){
	if(window.ethereum){
		//await window.ethereum.send("eth_requestAccounts");
		window.web3 = new Web3(window.ethereum);


		// Check current active chain
		const currentChainId  = await web3.eth.getChainId();

		// Change chain if not Goerli
		// if(currentChainId != vows.chainId) {
		// 	await window.ethereum.request({
		// 		method: "wallet_switchEthereumChain",
		// 		params: [{ chainId: vows.chain }] // number 5 in hex is 0x5
		// 	});
		// }
		contract = new web3.eth.Contract(vows.ABI, vows.contract)
		
		// let accounts = await web3.eth.getAccounts();
		// account = accounts[0];

		// // Change DOM 
		// connectButton.classList.add("invisible");
		// showConnectedAddress();
		// isMarried();
		// hasProposed();
		
		
	} else {
		alert("Metamask not detected");
	}
}

async function getTotalSupply(){
	//await connect();
	totalSupply = await contract.methods.totalSupply().call()
	return totalSupply

}

async function getMarriages(){
	await connect();
	await getTotalSupply();
	totalSupply = Number(totalSupply);
	for (let i = 0; i < totalSupply; i++) {
		getMetadata(i)
		
	}
	setTimeout(() => {
  		setMarriages();
		renderMarriages();
	}, 2000)
	

}

async function getMetadata(i){
	
	// contract = new web3.eth.Contract(vows.ABI, vows.contract)
	// First get the token ID for the marriage index
	const tokenId = await contract.methods.tokenByIndex(i).call();
	const tokenURI = await contract.methods.tokenURI(tokenId).call()
	
	const [, base64] = tokenURI.split(",");
	const metadata = atob(base64);
	marriageMetadata[i] = JSON.parse(metadata);
	marriageMetadata[i].id = tokenId
}

async function setMarriages(){
	console.log("setMarriages run")
	for (let i = 0; i < marriageMetadata.length; i++) {
		const svgString = getSVG(i);
		const svgData = svgToData(svgString)
		marriagesData[i] = svgData
		marriagesData[i].index = i
		marriagesData[i].token = marriageMetadata[i]
	}
	marriagesData.sort((a, b) => a.blockNumber - b.blockNumber);
}

function getSVG(index){
	const [, base64] = marriageMetadata[index].image.split(",");
	const svgString = atob(base64);
	return svgString
}

function svgToData(svgString){
	let temp;
	// Get block number
	temp = svgString.split('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: black; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="white" /><text x="10" y="20" class="base">In the block number ');
	temp = temp[1].split(',</text><text x="10" y="40" class="base">')
	temp[1] = temp[1].split('</text><text x="10" y="60" class="base">and</text><text x="10" y="80" class="base">')
	temp[1][1] = temp[1][1].split('</text><text x="10" y="100" class="base">were happily united.</text><text x="10" y="120" class="base"></text><text x="10" y="140" class="base">May their union grow with wisdom and grace.</text></svg>')
	const newBlockNumber = temp[0]
	const newProposer = temp[1][0]
	const newAccepter = temp[1][1][0]
	const data = {
		blockNumber: newBlockNumber,
		proposer: newProposer,
		accepter: newAccepter
	}
	return data;
}


document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
	connect();
	getMarriages();
});


async function renderMarriages(){
	await setMarriages();
	

	while (marriagesDiv.hasChildNodes()) {
		marriagesDiv.removeChild(marriagesDiv.childNodes[0]);
	}

	
	if(marriagesOrder === "mostRecent"){
		mostRecentBtn.checked = true;
		oldestBtn.checked = false;
		marriagesData.sort((a, b) => b.blockNumber - a.blockNumber);

		let marriageIndex = marriagesData.length/2;

		for (let i = 1; i < marriagesData.length; i = i + 2) {
			const index = marriageIndex;
			marriageIndex -= 1;
			const blockNumber = marriagesData[i].blockNumber;
			const proposer = marriagesData[i].proposer;
			const accepter = marriagesData[i].accepter;
			const tokenId = marriagesData[i].token.id;
			createCard(index, blockNumber, proposer, accepter, tokenId)
		}

	} else if(marriagesOrder === "oldest"){
		mostRecentBtn.checked = false;
		oldestBtn.checked = true;
		marriagesData.sort((a, b) => a.blockNumber - b.blockNumber);

		let marriageIndex = 1;

		for (let i = 1; i < marriagesData.length; i = i + 2) {
			const index = marriageIndex;
			marriageIndex += 1;
			const blockNumber = marriagesData[i].blockNumber;
			const proposer = marriagesData[i].proposer;
			const accepter = marriagesData[i].accepter;
			const tokenId = marriagesData[i].token.id;
			createCard(index, blockNumber, proposer, accepter, tokenId)
		}
	}

}


function createCard(index, blockNumber, proposer, accepter, tokenId){
	// Base Col
	const colDiv = document.createElement("div");
	colDiv.classList.add("col");
	// Base Card
	const cardDiv = document.createElement("div");
	cardDiv.classList.add("card");
	cardDiv.classList.add("border-purple");


	// Base Card > Card Body
	const cardBodyDiv = document.createElement("div");
	cardBodyDiv.classList.add("card-body");
	// Base Card > Card Body > Card Title
	const cardTitleEl = document.createElement("h5");
	cardTitleEl.classList.add("card-title");
	cardTitleEl.innerText = "Marriage #" + index;
	// Base Card > Card Body > Card Text
	const cardTextEl = document.createElement("p");
	cardTextEl.classList.add("card-text");
	cardTextEl.innerHTML = `In the block number <strong>${blockNumber},</strong><br /><strong>${smallAddress(proposer)}</strong> and <strong>${smallAddress(accepter)}</strong> were happily united.<br />May their union grow with wisdom and grace.`;

	// Base Card > Card Footer TOKEN
	const cardFooterTokenDiv = document.createElement("div");
	cardFooterTokenDiv.classList.add("card-footer");

	const rowTokenDiv = document.createElement("div");
	rowTokenDiv.classList.add("row");

	const colTokenDiv = document.createElement("div");
	colTokenDiv.classList.add("col-12");
	colTokenDiv.classList.add("text-truncate");

	const smallTokenEl = document.createElement("small");
	smallTokenEl.classList.add("text-muted");
	smallTokenEl.innerText = `Token ID: ${tokenId}`;

	// Base Card > Card Footer Proposer
	const cardFooterProposerDiv = document.createElement("div");
	cardFooterProposerDiv.classList.add("card-footer");

	const smallProposerEl = document.createElement("small");
	smallProposerEl.classList.add("text-muted");
	smallProposerEl.innerHTML = `Proposer: <a href="https://etherscan.io/address/${proposer}" target="_blank">${proposer}</a>`;

	// Base Card > Card Footer Accepter
	const cardFooterAccepterDiv = document.createElement("div");
	cardFooterAccepterDiv.classList.add("card-footer");

	const smallAccepterEl = document.createElement("small");
	smallAccepterEl.classList.add("text-muted");
	smallAccepterEl.innerHTML = `Accepter: <a href="https://etherscan.io/address/${accepter}" target="_blank">${accepter}</a>`;

	// Base Card > Card Footer View NFT Button
	const cardFooterViewNftDiv = document.createElement("div");
	cardFooterViewNftDiv.classList.add("card-footer");

	const viewNftGridDiv = document.createElement("div");
	viewNftGridDiv.classList.add("d-grid");
	viewNftGridDiv.classList.add("gap-2");

	const viewNftBtn = document.createElement("a");
	viewNftBtn.classList.add("btn");
	viewNftBtn.classList.add("btn-primary");
	viewNftBtn.classList.add("btn-sm");
	viewNftBtn.setAttribute("role", "button");
	viewNftBtn.setAttribute("target", "_blank");
	viewNftBtn.innerText = "View NFT";
	viewNftBtn.setAttribute("href", `https://opensea.io/assets/ethereum/${vows.contract}/${tokenId}`);

	marriagesDiv.append(colDiv);
	colDiv.append(cardDiv);

	cardDiv.append(cardBodyDiv);
	cardBodyDiv.append(cardTitleEl);
	cardBodyDiv.append(cardTextEl);

	cardDiv.append(cardFooterTokenDiv);
	cardFooterTokenDiv.append(rowTokenDiv);
	rowTokenDiv.append(colTokenDiv);
	colTokenDiv.append(smallTokenEl);

	cardDiv.append(cardFooterProposerDiv);
	cardFooterProposerDiv.append(smallProposerEl);

	cardDiv.append(cardFooterAccepterDiv);
	cardFooterAccepterDiv.append(smallAccepterEl);

	cardDiv.append(cardFooterViewNftDiv);
	cardFooterViewNftDiv.append(viewNftGridDiv);
	viewNftGridDiv.append(viewNftBtn);

}