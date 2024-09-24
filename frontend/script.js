const provider = new ethers.providers.Web3Provider(window.ethereum);
const abi = [
  "event AccountCreated(address[] owners, uint256 indexed id, uint256 timestamp)",
  "event Deposit(address indexed user, uint256 indexed accountId, uint256 value, uint256 timestamp)",
  "event Withdraw(uint256 indexed withdrawId, uint256 timestamp)",
  "event WithdrawRequested(address indexed user, uint256 indexed accountId, uint256 indexed withdrawId, uint256 amount, uint256 timestamp)",
  "function approveWithdrawl(uint256 accountId, uint256 withdrawId)",
  "function createAccount(address[] otherOwners)",
  "function deposit(uint256 accountId) payable",
  "function getAccounts() view returns (uint256[])",
  "function getApprovals(uint256 accountId, uint256 withdrawId) view returns (uint256)",
  "function getBalance(uint256 accountId) view returns (uint256)",
  "function getOwners(uint256 accountId) view returns (address[])",
  "function requestWithdrawl(uint256 accountId, uint256 amount)",
  "function withdraw(uint256 accountId, uint256 withdrawId)",
];

const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with your contract address
let contract = null;

async function createAccount() {
  try {
    await getAccess();
    const owners = document.getElementById("owners").value.split(",").filter(n => n.trim());
    console.log(owners);
    await contract.createAccount(owners).then(() => alert("Account Created Successfully"));
  } catch (error) {
    console.error("Error creating account:", error);
    alert(`Error creating account: ${error.message}`);
  }
}

async function viewAccounts() {
  try {
    await getAccess();
    const result = await contract.getAccounts();
    console.log(result);
    document.getElementById("accounts").innerHTML = result.join(", ");
  } catch (error) {
    console.error("Error viewing accounts:", error);
    alert(`Error viewing accounts: ${error.message}`);
  }
}

async function deposit() {
  try {
    await getAccess();
    const accountId = document.getElementById("depositAccountId").value;
    const amount = document.getElementById("depositAmount").value;
    await contract.deposit(accountId, { value: ethers.utils.parseUnits(amount, "wei") }).then(() => alert("Deposit Successful"));
  } catch (error) {
    console.error("Error making deposit:", error);
    alert(`Error making deposit: ${error.message}`);
  }
}

async function requestWithdrawal() {
  try {
    await getAccess();
    const accountId = document.getElementById("requestWithdrawAccountId").value;
    const amount = document.getElementById("withdrawAmount").value;
    await contract.requestWithdrawl(accountId, ethers.utils.parseUnits(amount, "wei")).then(() => alert("Withdrawal Request Submitted"));
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    alert(`Error requesting withdrawal: ${error.message}`);
  }
}

async function approveWithdrawal() {
  try {
    await getAccess();
    const accountId = document.getElementById("approveAccountId").value;
    const withdrawId = document.getElementById("approveWithdrawId").value;
    await contract.approveWithdrawl(accountId, withdrawId).then(() => alert("Withdrawal Approved"));
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    alert(`Error approving withdrawal: ${error.message}`);
  }
}

async function withdraw() {
  try {
    await getAccess();
    const accountId = document.getElementById("withdrawAccountId").value;
    const withdrawId = document.getElementById("finalWithdrawId").value;
    await contract.withdraw(accountId, withdrawId).then(() => alert("Withdrawal Successful"));
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    alert(`Error withdrawing funds: ${error.message}`);
  }
}

async function getAccess() {
  if (contract) return;
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  contract = new ethers.Contract(address, abi, signer);

  const eventLog = document.getElementById("events");
  contract.on("AccountCreated", (owners, id, event) => {
    eventLog.append(`Account Created: ID = ${id}, Owners = ${owners.join(", ")}\n`);
  });
  contract.on("Deposit", (user, accountId, value, timestamp) => {
    eventLog.append(`Deposit: User = ${user}, Account ID = ${accountId}, Value = ${value}, Timestamp = ${timestamp}\n`);
  });
  contract.on("WithdrawRequested", (user, accountId, withdrawId, amount, timestamp) => {
    eventLog.append(`Withdraw Requested: User = ${user}, Account ID = ${accountId}, Withdraw ID = ${withdrawId}, Amount = ${amount}, Timestamp = ${timestamp}\n`);
  });
  contract.on("Withdraw", (withdrawId, timestamp) => {
    eventLog.append(`Withdraw: Withdraw ID = ${withdrawId}, Timestamp = ${timestamp}\n`);
  });
}
