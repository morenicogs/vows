![vows logo](https://morenicogs.github.io/vows/ogImage.jpg)

# Vows
Vows is a front-end website to interact with the [Vows smart-contract (0x2d76705e0ab39dcbb4e178bffaf866847c199b90)](https://etherscan.io/address/0x2d76705e0ab39dcbb4e178bffaf866847c199b90#code) created by [@domhofmann](https://github.com/domhofmann)

I started learning Javascript during summer 2022 and this is my first go with web3.js. As an exercise I created this front-end for a smart-contract on the Ethereum Blockchain created by [@dhof](https://twitter.com/dhof). 

This contract is actually on of the main reasons why Solidity is the next step in my learning process. 

As a designer I also added an additional branding where I went for a curly but trendy logo-type in purple. 

## Usage
Click the Connect Wallet button to see your options. 

For the connected address it will automatically check if this address has proposed to someone before or if they are married or not. 

### Send & Accept Proposal
Send a proposal by connecting your wallet, adding the address you want to propose to and ask the question "Will you marry me?". 

If the address proposes or has already proposed, a custom URL is generated to accept the proposal. This link can be send to the address you are proposing too.

If a proposal is accepted, and the connected address is married, the NFT created, a Vow, will be displayed together with the option to annul this marriage. 

### See Marriages
On the page [Marriages](https://morenicogs.github.io/vows/marriage.html) you can find an overview of all marriages currently on the blockchain. 