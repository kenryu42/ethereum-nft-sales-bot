import { ethers } from 'ethers';

const a = ethers.BigNumber.from('16000000000000000000');
const b = ethers.BigNumber.from('400000000000000000');
const c = a.sub(b);
const d = ethers.utils.formatEther(c.toString());

console.log(d);
