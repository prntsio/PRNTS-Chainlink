// import { getStorageValue, setStorageValue } from '../utils/local-storage/local-storage';
import { ethers, Signature, utils } from "ethers";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Deferrable } from "ethers/lib/utils";
import { KEYS } from "../constants/contants";
import { getStorageValue, setStorageValue } from "./storage-service";
// import { PRNTS_PRIVATE_KEY, PRNTS_PUBLIC_KEY } from '../utils/local-storage/keys';

export const ethersProvider = () => {
  return window?.ethereum
    ? new ethers.providers.Web3Provider(window.ethereum)
    : new ethers.providers.JsonRpcProvider(process.env.VITE_ALCHEMY_KEY);
};

export const getLibrary = (provider: any) => {
  return new Web3Provider(provider);
};

export const getSigner = (): Wallet | JsonRpcSigner => {
  if (window?.ethereum) {
    return ethersProvider().getSigner();
  }

  /**
   * No wallet flow
   */
  let signer;
  const storedPrivateKey = getStorageValue("PRIVATE_KEY");
  if (!!storedPrivateKey) {
    signer = new ethers.Wallet(storedPrivateKey, ethersProvider());
  } else {
    signer = ethers.Wallet.createRandom();
    signer.connect(ethersProvider());
    setStorageValue(KEYS.PRNTS_PRIVATE_KEY, signer.privateKey);
    setStorageValue(KEYS.PRNTS_PUBLIC_KEY, signer.publicKey);
  }
  return signer;
};

export const getAddressFromSigner = async () => {
  return await getSigner().getAddress();
};

export const init = async () => {
  const accounts = window?.ethereum
    ? await window.ethereum.request({ method: "eth_requestAccounts" })
    : [await getSigner().getAddress()];
  setStorageValue(KEYS.PRNTS_PUBLIC_KEY, accounts[0]);
  return accounts[0];
};

export const signText = (text: string): Promise<string> => {
  return getSigner().signMessage(text);
};

export const splitSignature = (signature: string): Signature => {
  return utils.splitSignature(signature);
};

export const sendTx = (transaction: Deferrable<TransactionRequest>) => {
  const signer = ethersProvider().getSigner();
  return signer.sendTransaction(transaction);
};

export const isUsingWallet = async () => {
  if (!window?.ethereum) {
    return false;
  }
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const addresses = await provider.listAccounts();
  // it doesn't create metamask popup
  return !!(addresses && addresses.length > 0);
};

export const hasWallet = () => {
  return window.ethereum !== undefined;
};
