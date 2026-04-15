require("dotenv").config({ path: "./backend/.env" });
const { Client, TopicCreateTransaction, AccountId, PrivateKey } = require("@hashgraph/sdk");

async function main() {
    const client = Client.forTestnet();
    client.setOperator(
        AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
        PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
    );

    console.log("[*] Creating HCS topics on Hedera testnet...\n");

    console.log("[1/2] Creating Morpheme-X primary topic...");
    const morpheme = await (await new TopicCreateTransaction()
        .setTopicMemo("AMX Morpheme-X Log")
        .execute(client)).getReceipt(client);
    console.log("     ✓ HCS_TOPIC_ID=" + morpheme.topicId + "\n");

    console.log("[2/2] Creating Sentinel anomaly topic...");
    const sentinel = await (await new TopicCreateTransaction()
        .setTopicMemo("AMX Sentinel")
        .execute(client)).getReceipt(client);
    console.log("     ✓ HCS_SENTINEL_TOPIC_ID=" + sentinel.topicId + "\n");

    console.log("[+] Update your backend/.env with:\n");
    console.log("    HCS_TOPIC_ID=" + morpheme.topicId);
    console.log("    HCS_SENTINEL_TOPIC_ID=" + sentinel.topicId);
    console.log("    SIMULATE_HCS=false\n");
    console.log("[✓] Topics created! Copy the IDs above into .env and restart the backend.\n");

    client.close();
}

main().catch(console.error);
