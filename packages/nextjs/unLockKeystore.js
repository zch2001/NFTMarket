const fs = require("fs");
const { Wallet } = require("ethers");

// 替换为你的 keystore 文件路径
const keystorePath = "/Users/zhouchuhan/.foundry/keystores/scaffold-eth-custom";

// 替换为你生成 keystore 时设置的密码
const password = "aaaaaa1479";

(async () => {
    try {
        const keystore = fs.readFileSync(keystorePath, "utf8");
        const wallet = await Wallet.fromEncryptedJson(keystore, password);
        console.log("Address:", wallet.address);
        console.log("Private Key:", wallet.privateKey);
    } catch (err) {
        console.error("Error unlocking keystore:", err.message);
    }
})();
