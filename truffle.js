var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "lesson reform tornado smoke hawk slice remind occur axis trap acoustic angry";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: "7545",
      network_id: "*"
    },
    rinkeby: {
      provider: function() {
       return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/a4827a64d92a4f2bae233502e5b6066a");
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
  }
  }
}
