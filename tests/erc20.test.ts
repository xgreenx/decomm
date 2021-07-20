import { expect } from "chai";
import { artifacts, network, patract } from "redspot";

const { getContractFactory, getRandomSigner } = patract;

const { api, getAddresses, getSigners } = network;

describe("ERC20", () => {
  after(() => {
    return api.disconnect();
  });

  async function setup({
    tokenName = 'Atomikoin',
    tokenSymbol = 'ATK',
    tokenInitialSupply = 1000
  } = {}) {
    await api.isReady
    const signerAddresses = await getAddresses();
    const Alice = signerAddresses[0];
    const sender = await getRandomSigner(Alice, "10000 UNIT");
    const contractFactory = await getContractFactory("erc20", sender.address);
    const contract = await contractFactory.deploy("new", tokenName, tokenSymbol, tokenInitialSupply);
    const abi = artifacts.readArtifact("erc20");
    const receiver = await getRandomSigner();

    return { sender, contractFactory, contract, abi, receiver, Alice };
  }

  it("Assigns initial balance", async () => {
    const { contract, sender } = await setup();
    const result = await contract.query.balanceOf(sender.address);
    expect(result.output).to.equal(1000);
  });

  it("Transfer adds amount to destination account", async () => {
    const { contract, receiver } = await setup();

    await expect(() =>
      contract.tx.transfer(receiver.address, 7)
    ).to.changeTokenBalance(contract, receiver, 7);

    await expect(() =>
      contract.tx.transfer(receiver.address, 7)
    ).to.changeTokenBalances(contract, [contract.signer, receiver], [-7, 7]);
  });

  it("Transfer emits event", async () => {
    const { contract, sender, receiver } = await setup();

    await expect(contract.tx.transfer(receiver.address, 7))
      .to.emit(contract, "Transfer")
      .withArgs(sender.address, receiver.address, 7);
  });

  it("Can not transfer above the amount", async () => {
    const { contract, receiver } = await setup();

    await expect(contract.tx.transfer(receiver.address, 1007)).to.not.emit(
      contract,
      "Transfer"
    );
  });

  it("Can not transfer from empty account", async () => {
    const { contract, Alice, sender } = await setup();

    const emptyAccount = await getRandomSigner(Alice, "10 UNIT");

    await expect(
      contract.connect(emptyAccount).tx.transfer(sender.address, 7)
    ).to.not.emit(contract, "Transfer");
  });

  it("Assigns metadata", async () => {
    const tokenName = 'We are the champions';
    const tokenSymbol = 'WATCH';
    const tokenInitialSupply = 12345;
    const { contract, sender } = await setup({ tokenName, tokenSymbol, tokenInitialSupply });

    const decimalsResult = await contract.query.decimals();
    expect(decimalsResult.output).to.equal(18);

    const symbolResult = await contract.query.symbol();
    // FIXME: use .to.eq assertion
    expect(symbolResult.output?.toHuman()).to.contain(tokenSymbol);

    const nameResult = await contract.query.name();
    // FIXME: use .to.eq assertion
    expect(nameResult.output?.toHuman()).to.contain(tokenName);

    const balanceOfResult = await contract.query.balanceOf(sender.address);
    expect(balanceOfResult.output).to.equal(tokenInitialSupply)
  });
});
