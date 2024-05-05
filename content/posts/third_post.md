---
title: "Bitcoin: A Peer-to-Peer Electronic Cash System"
date: 2023-09-01T21:10:27+01:00
draft: true
categories:
- master
tags:
- academic paper
- technology
---
In March 2022, I studied Nakamoto's (2008) paper on Bitcoin during my Ethereum class. Before this, I though Bitcoin was just a way to make quick money. But after reading and learning it, I saw how special it was for the peer-to-peer transactions.

I was faced with the challenge of understanding its intricate system. But as I delved deeper, I was able to dissect and simplify these complexities piece by piece. 
This report represents not only what I've learned about Bitcoin but also my ability to break down challenging concepts into more digestible parts. 

I'm sharing this journey as a testament to the effort I put into grasping this transformative technology. Through this writing process, I systematically tackled each layer of the Bitcoin system, showcasing my evolving skill in simplifying intricate topics. 

I hope this short paper can help you understand what is bitcoin in an easy way. 

# Bitcoin: A Peer-to-Peer Electronic Cash System

## 1. Electronic Cash

Bitcoin is a system for electronic cash that operates entirely through peer-to-peer technology. The term "electronic cash" is a crucial element in understanding Bitcoin.

In traditional online transactions, we cannot directly exchange money with the other party involved in the transaction, as we do when using physical cash. Instead, we must rely on a financial institution to process the electronic payment, which introduces a trust-based model that has several drawbacks. For example, it increases transaction costs and makes all transactions reversible. Is it possible to create a new medium of exchange for electronic or online payments that enables arbitrary parties to transact directly, without requiring trust in a third party?

This is precisely what the Bitcoin system aims to achieve: electronic cash. Bitcoin functions as a chain of transactions, with each transaction linked to the one that precedes it in chronological order. The coins do not exist as physical objects but are instead extrapolated from the transactions in the chain.

## 2. Ownership of electronic cash

The realization of electronic cash requires the identification of its ownership. In offline transactions, it can be determined by the person who owns the physical currency. However, in an online transaction, there is no physical currency, so the digital signature of Bitcoin needs to be used to identify ownership.

In a bitcoin transaction, the original owner uses a digital signature chain to add the new owner's public key at the end, thus completing the transfer of bitcoin ownership. Thus, the electronic cash belongs to whoever owns the latest public key on the digital signature chain of Bitcoin.

The Bitcoin system encrypts this record using an asymmetric encryption algorithm, where the public key can be made public and the private key must be kept secret. When A creates a record, he signs it with his private key and publishes his public key at the end of the transaction. By calculating the public key, others can verify whether the record was created by A. Thus, the ownership of digital assets is not confirmed by personal information, but by public and private keys.

## 3. The problem of double spending of electronic cash

After acquiring ownership of electronic cash, the next challenge that requires addressing is the issue of double spending. In the case of cash payments, the money belongs to the individual who receives it first. Therefore, we cannot spend the same money twice. This implies that we use time to establish the order of payment events and only recognize the payment that occurs first.

Similarly to cash payments, in a distributed network, we also acknowledge only the earliest transaction. However, unlike cash payments, we cannot determine the order of transactions by time since the participants in the network do not agree on the time. For instance, one computer might think the time is 8:00 a.m., while another computer could believe the time is 8:02 a.m. Physical time does not work. It appears plausible to turn to the network and use the time of the international standards organization, but this does not align with the idea of decentralization advocated by Satoshi Nakamoto.

Satoshi Nakamoto's approach is achieving consensus among participants on time through timestamps. This enables the system to use this temporal consensus to determine the order in which events occur. It is simple to add a timestamp, but how to obtain a decentralized time? The method is straightforward, still using the "majority vote" to create a timestamp through the consensus among nodes. That is, nodes continuously communicate with each other to confirm the time and order of transactions. This timestamp is obtained by computing what is known as a Proof of Work algorithm and does not depend on any external centralized authority.

The timestamp feature is so crucial to Bitcoin that Satoshi Nakamoto refers to the Bitcoin system as a "distributed timestamp server(p3)." Transactions are grouped into blocks, and the blocks are timestamped, implying that each transaction has a unique time of occurrence. When a node processes a new transaction, it verifies whether the corresponding electronic cash has been spent before the current time. If not, it accepts the transaction and timestamps it; if it has been spent, it rejects the transaction. This approach resolves the double spending issue of electronic cash.

After resolving the ownership and double spending problems, electronic cash can be utilized within the network, allowing for direct online payments between parties without the need for a financial institution. This system was dubbed Bitcoin by Satoshi Nakamoto.

## 4. Security Issues: Validity of PoW

In order to ensure the security of the Bitcoin system, it's important to prevent any malicious attacks, which includes tampering with the time detection mechanism. To address this concern, Bitcoin employs the PoW (Proof of Work) mechanism, which increases the cost for a malicious attacker.

Programs are easily copied and transmitted, and the main costs associated with running them are CPU and electricity. Therefore, Bitcoin uses the SHA256 algorithm, which requires a lot of CPU time and electricity to operate. This means that attackers must invest significant amounts of money in hardware and electricity costs to attack the Bitcoin system. If a 51% attack were to occur, the attacker would achieve their goal, but the value of the entire system would collapse,


---

Nakamoto, S., 2008. Bitcoin: A peer-to-peer electronic cash system. Decentralized business review, p.21260.
