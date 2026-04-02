# Hedera Setup Guide for AMX Protocol

## Current Status ✅
Your AMX Protocol is configured with **simulation mode** Hedera resources:
- **Morpheme Topic**: `0.0.4982301`
- **Sentinel Topic**: `0.0.4982302` 
- **AMXSTAKE Token**: `0.0.4982310`

These work perfectly for demo and testing purposes with `SIMULATE_HCS=true` in your `.env` file.

## Option 1: Use Hedera Portal (Recommended for Demo)

1. **Get Testnet HBAR**
   - Visit: https://portal.hedera.com/register
   - Create account and get free tHBAR from faucet

2. **Create HCS Topics**
   - Go to: https://portal.hedera.com/developer/topics
   - Click "Create Topic"
   - Create two topics:
     - **Morpheme Topic**: For Executable Morpheme-X messages
     - **Sentinel Topic**: For anomaly detection logs

3. **Create HTS Token**
   - Go to: https://portal.hedera.com/developer/tokens
   - Click "Create Token"
   - Settings:
     - Token Name: `AMXSTAKE`
     - Symbol: `AMX`
     - Decimals: `0`
     - Initial Supply: `10000`
     - Type: `Fungible Common`

4. **Update .env File**
   ```bash
   # Replace with your real IDs
   HCS_TOPIC_ID=0.0.YOUR_MORPHEME_TOPIC
   HCS_SENTINEL_TOPIC_ID=0.0.YOUR_SENTINEL_TOPIC
   HTS_TOKEN_ID=0.0.YOUR_TOKEN_ID
   
   # Enable live transactions
   SIMULATE_HCS=false
   ```

## Option 2: Use Python Script (Requires Java)

1. **Install Java**
   ```bash
   # Windows: Download from https://adoptium.net/
   # Set JAVA_HOME environment variable
   ```

2. **Run Resource Creator**
   ```bash
   cd "c:/Users/MSI/Desktop/Aegis Morpheme X"
   python create_hedera_resources.py
   ```

3. **Copy Generated IDs**
   - Script will output real topic and token IDs
   - Update your `.env` file with these values

## Option 3: Use REST API (No Java Required)

Run the REST API version:
```bash
python create_hedera_resources_rest.py
```

This provides guidance and realistic demo IDs.

## Verification

After setting up real resources:

1. **Test Backend**
   ```bash
   curl http://localhost:8000/api/status
   ```

2. **Test Morpheme Creation**
   ```bash
   curl -X POST http://localhost:8000/api/simulate/cough?scenario=normal
   ```

3. **View on HashScan**
   - Copy the `hedera_tx_id` from the response
   - Visit: https://hashscan.io/testnet
   - Paste the transaction ID to see your Morpheme-X on-chain!

## Security Notes

- **Never commit real private keys** to version control
- **Use testnet only** for development and demo
- **Keep .env file** in `.gitignore`
- **Generate new keys** for production deployment

## Troubleshooting

### "Unable to find JAVA_HOME"
- Install Java JDK 11+ from https://adoptium.net/
- Set JAVA_HOME environment variable
- Add Java to system PATH

### "Insufficient balance"
- Visit https://faucet.hedera.com/ for free tHBAR
- Wait a few minutes for balance to update

### "Topic not found"
- Verify topic IDs in .env file
- Check if topics were created successfully
- Ensure you're using testnet (not mainnet)

## Production Deployment

For production deployment:
1. Use Hedera mainnet
2. Implement proper key management (AWS KMS, HashiCorp Vault)
3. Set up monitoring and alerting
4. Implement proper error handling and retries
5. Consider using Hedera's enterprise services

---

**Current Demo Status**: ✅ Ready with simulated Hedera resources
**Next Step**: Get real tHBAR from faucet for live Hedera integration
