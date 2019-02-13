App = {
  contracts: {},
  web3Provider: null,
  account: '0x0',
  loading: false,
  tokenPrice: '',
  tokensSold: '',
  tokensAvailable: 0,
  getTokenBalance: async () => {
    let dappTokenInstance = await App.contracts.DappToken.deployed();
    let balance = await dappTokenInstance.balanceOf(App.account);
    $('.dapp-balance').html(balance.toNumber());
  },
  loadTokenSaleContract: async () => {
    let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();
    App.getTokensAvailable(dappTokenSaleInstance);
    await App.getTokenPrice(dappTokenSaleInstance);
    await App.getTokensSold(dappTokenSaleInstance);
    App.showProgress();
  },
  showProgress: () => {
      let progressPercent = 100 * (App.tokensSold / App.tokensAvailable);
      $('#progress').css('width', progressPercent, '%');
  },
  getTokensAvailable: async (dappTokenSaleInstance) => {
    let dappTokenInstance = await App.contracts.DappToken.deployed();
    let tokensRemaining = await dappTokenInstance.balanceOf(dappTokenSaleInstance.address);
    let tokensSold = await dappTokenSaleInstance.tokensSold();
    App.tokensAvailable = tokensSold.toNumber() + tokensRemaining.toNumber();
    $('.tokens-available').html(App.tokensAvailable);
  },
  getTokenPrice: async (dappTokenSaleInstance) => {
    let tokenPrice = await dappTokenSaleInstance.tokenPrice();
    App.tokenPrice = tokenPrice.toNumber();
    $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
  },
  getTokensSold: async (dappTokenSaleInstance) => {
    let tokensSold = await dappTokenSaleInstance.tokensSold();
    App.tokensSold = tokensSold.toNumber();
    $('.tokens-sold').html(App.tokensSold);
  },
  init: () => {
    return App.initWeb3();
  },

  initWeb3: () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContracts();
  },
  initContracts: () => {
    $.getJSON("DappTokenSale.json", async dappTokenSale => {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();
      console.log("Dapp Token Sale Address: " + dappTokenSaleInstance.address);
      App.listenForEvents();
    });

    $.getJSON("DappToken.json", async dappToken => {
      App.contracts.DappToken = TruffleContract(dappToken);
      App.contracts.DappToken.setProvider(App.web3Provider);
      dappTokenInstance = await App.contracts.DappToken.deployed();
      console.log("Dapp Token Address:", dappTokenInstance.address);
      return App.render();
    });
  },
  buyTokens: async () => {
    $('#content').hide();
    $('#loader').show();
    let numberOfTokens = $('#numberOfTokens').val();
    let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();
    await dappTokenSaleInstance.buyTokens(numberOfTokens, {
      from: App.account,
      value: numberOfTokens * App.tokenPrice,
      gas: 500000
    });
    console.log("Tokens bought...");

  },
  listenForEvents: async () => {
    let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();
    dappTokenSaleInstance.Sell({},{
      fromBlock: 0,
      toBlock: 'latest',
    }).watch( (error, event) => {
        console.log("Event triggered");
        App.render();
    });
  },
  render: () => {
    if (App.loading) {
      return;
    }
    App.loading = true;

    $('#loader').show();
    $('#content').hide();

    web3.eth.getCoinbase((err, account) => {
        if (err === null) {
          App.account = account;
         $('#accountAddress').html("Your Account: " + account);
         App.loadTokenSaleContract();
         App.getTokenBalance();

         App.loading = false;
         let loader = $('#loader');
         let content = $('#content');
         $('#loader').hide();
         $('#content').show();
       } else {
         alert("Can't access your account!");
       }
     });
   }
  }

$(() => {
  App.init();
});
