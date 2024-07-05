"use strict";(self.webpackChunk_builddao_near_social_js=self.webpackChunk_builddao_near_social_js||[]).push([[421],{370:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>h,contentTitle:()=>l,default:()=>g,frontMatter:()=>r,metadata:()=>d,toc:()=>u});var t=a(4848),s=a(8453),c=a(1470),i=a(9365),o=a(4252);const r={},l="Depositing NEAR for Storage",d={id:"advanced/storage-deposit-withdraw",title:"Depositing NEAR for Storage",description:"<TOCInline",source:"@site/docs/advanced/storage-deposit-withdraw.mdx",sourceDirName:"advanced",slug:"/advanced/storage-deposit-withdraw",permalink:"/near-social-js/advanced/storage-deposit-withdraw",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"docs",previous:{title:"Granting Write Permission",permalink:"/near-social-js/advanced/granting-write-permission"},next:{title:"API Reference",permalink:"/near-social-js/api-reference/"}},h={},u=[{value:"Overview",id:"overview",level:2},{value:"Overview",id:"overview-1",level:2}];function p(e){const n={code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"depositing-near-for-storage",children:"Depositing NEAR for Storage"}),"\n",(0,t.jsx)(o.A,{maxHeadingLevel:4,toc:u}),"\n",(0,t.jsx)(n.h2,{id:"overview",children:"Overview"}),"\n",(0,t.jsx)(n.p,{children:"When depositing NEAR to the social DB contract, you can cover the storage cost for a specific account_id or the signer if account_id is not provided. You can also choose to pay the bare minimum deposit required for registering the account in the Social DB contract without any additional storage fees."}),"\n",(0,t.jsx)(n.p,{children:"The signer account MUST have sufficient NEAR balance to cover the deposit."}),"\n",(0,t.jsxs)(c.A,{defaultValue:"javascript-via-package-manager",values:[{label:"JavaScript (via package manager)",value:"javascript-via-package-manager"},{label:"JavaScript (via CDN)",value:"javascript-via-cdn"},{label:"TypeScript",value:"typescript"}],children:[(0,t.jsx)(i.A,{value:"javascript-via-package-manager",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"const { Social } = require('@builddao/near-social-js');\n\nconst signer = await nearConnection.account('alice.near');\nconst accessKeys = await signer.getAccessKeys();\nconst social = new Social();\nconst transaction = await social.storageDeposit({\nblockHash: accessKeys[0].block_hash,\nnonce: BigInt(accessKeys[0].nonce + 1), // the nonce to be used for the transaction, must be greater than the access key nonce\npublicKey: accessKeys[0].public_key,\nsigner,\nregistration_only: true, // set to true if you want to pay only the bare minimum deposit\naccount_id: 'bob.near', // optional, defaults to the signer account\ndeposit: '10000000000000000000000', // the amount to deposit in yoctoNEAR\n});\n// ...sign the returned transaction and post to the network\n"})})}),(0,t.jsx)(i.A,{value:"javascript-via-cdn",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"var accessKeys;\nvar signer;\nvar social;\n\nnearConnection.account('alice.near')\n  .then((_signer) => {\n    signer = _signer;\n\n    return signer.getAccessKeys();\n  })\n  .then((_accessKeys) => {\n    accessKeys = _accessKeys;\n    social = new NEARSocialSDK();\n\n    return social.storageDeposit({\n      blockHash: accessKeys[0].block_hash,\n      nonce: BigInt(accessKeys[0].nonce + 1), // the nonce to be used for the transaction, must be greater than the access key nonce\n      publicKey: accessKeys[0].public_key,\n      signer,\n      registration_only: true, // set to true if you want to pay only the bare minimum deposit\n      account_id: 'bob.near', // optional, defaults to the signer account\n      deposit: '10000000000000000000000', // the amount to deposit in yoctoNEAR\n    });\n  })\n  .then((transaction) => {\n    // ...sign the returned transaction and post to the network\n  });\n"})})}),(0,t.jsx)(i.A,{value:"typescript",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"import { Social } from '@builddao/near-social-js';\n\nconst signer = await nearConnection.account('alice.near');\nconst accessKeys = await signer.getAccessKeys();\nconst social = new Social();\nconst transaction = await social.storageDeposit({\n  blockHash: accessKeys[0].block_hash,\n  nonce: BigInt(accessKeys[0].nonce + 1), // the nonce to be used for the transaction, must be greater than the access key nonce\n  publicKey: accessKeys[0].public_key,\n  signer,\n  registration_only: true, // set to true if you want to pay only the bare minimum deposit\n  account_id: 'bob.near', // optional, defaults to the signer account\n  deposit: '10000000000000000000000', // the amount to deposit in yoctoNEAR\n});\n// ...sign the returned transaction and post to the network\n"})})})]}),"\n",(0,t.jsx)(n.h1,{id:"withdrawing-near-from-storage",children:"Withdrawing NEAR from Storage"}),"\n",(0,t.jsx)(o.A,{maxHeadingLevel:4,toc:u}),"\n",(0,t.jsx)(n.h2,{id:"overview-1",children:"Overview"}),"\n",(0,t.jsx)(n.p,{children:"When withdrawing NEAR from the social DB contract, you can specify the amount to withdraw. If no amount is specified, all available NEAR is withdrawn."}),"\n",(0,t.jsx)(n.p,{children:"The signer account MUST have sufficient NEAR balance available for withdrawal."}),"\n",(0,t.jsxs)(c.A,{defaultValue:"javascript-via-package-manager",values:[{label:"JavaScript (via package manager)",value:"javascript-via-package-manager"},{label:"JavaScript (via CDN)",value:"javascript-via-cdn"},{label:"TypeScript",value:"typescript"}],children:[(0,t.jsx)(i.A,{value:"javascript-via-package-manager",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"const { Social } = require('@builddao/near-social-js');\n\nconst signer = await nearConnection.account('alice.near');\nconst accessKeys = await signer.getAccessKeys();\nconst social = new Social();\nconst transaction = await social.storageWithdraw({\n  blockHash: accessKeys[0].block_hash,\n  nonce: BigInt(accessKeys[0].nonce + 1), // the nonce to be used for the transaction, must be greater than the access key nonce\n  publicKey: accessKeys[0].public_key,\n  signer,\n  amount: '5000000000000000000000', // the amount to withdraw in yoctoNEAR, optional, defaults to all available balance\n});\n// ...sign the returned transaction and post to the network\n"})})}),(0,t.jsx)(i.A,{value:"javascript-via-cdn",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",children:"var accessKeys;\nvar signer;\nvar social;\n\nnearConnection.account('alice.near')\n  .then((_signer) => {\n    signer = _signer;\n\n    return signer.getAccessKeys();\n  })\n  .then((_accessKeys) => {\n    accessKeys = _accessKeys;\n    social = new NEARSocialSDK();\n\n    return social.storageWithdraw({\n      blockHash: accessKeys[0].block_hash,\n      nonce: BigInt(accessKeys[0].nonce + 1), // the nonce to be used for the transaction, must be greater than the access key nonce\n      publicKey: accessKeys[0].public_key,\n      signer,\n      amount: '5000000000000000000000', // the amount to withdraw in yoctoNEAR, optional, defaults to all available balance\n    });\n  })\n  .then((transaction) => {\n    // ...sign the returned transaction and post to the network\n  });\n"})})}),(0,t.jsx)(i.A,{value:"typescript",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"import { Social } from '@builddao/near-social-js';\n\nconst signer = await nearConnection.account('alice.near');\nconst accessKeys = await signer.getAccessKeys();\nconst social = new Social();\nconst transaction = await social.storageWithdraw({\n  blockHash: accessKeys[0].block_hash,\n  nonce: BigInt(accessKeys[0].nonce + 1), // the nonce to be used for the transaction, must be greater than the access key nonce\n  publicKey: accessKeys[0].public_key,\n  signer,\n  amount: '5000000000000000000000', // the amount to withdraw in yoctoNEAR, optional, defaults to all available balance\n});\n// ...sign the returned transaction and post to the network\n"})})})]})]})}function g(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(p,{...e})}):p(e)}}}]);