# Security Policy

Sendra is infrastructure-grade software designed to handle high-value transactions. We take security seriously and prioritize the protection of our users' assets and data.

## Responsible Disclosure

If you discover a security vulnerability within Sendra, please give us the opportunity to resolve it before making it public. 

**Reporting a Vulnerability:**
- Send an email to [security@sendra.io](mailto:security@sendra.io) (or the maintainer's contact).
- Include a detailed description of the vulnerability.
- Provide steps to reproduce the issue.
- Mention the version of Sendra and the environment where it was found.

We will acknowledge receipt of your report within 48 hours and work with you to coordinate a disclosure timeline.

## Security Best Practices

### Private Key Handling
Sendra is **non-custodial**. 
- **NEVER** commit private keys or secret keys to version control.
- Always use environment variables or secure vault systems (e.g., AWS Secrets Manager, HashiCorp Vault) to manage keys.
- Signing should ideally happen in a secure, isolated context.

### RPC Security
- Use authenticated RPC endpoints whenever possible.
- Be aware that some public RPC nodes may log transaction data or simulate transactions for MEV purposes.

### Dependency Management
- We use **Bun** to manage dependencies and lockfiles.
- We regularly audit our internal packages and external dependencies for known vulnerabilities.

## Production Cautions

While Sendra is designed for reliability, it operates in the highly volatile environment of the Solana network.
- **Slippage:** Always set appropriate slippage limits for swaps.
- **Network Congestion:** During extreme congestion, even with optimized fees, transactions may still fail or take longer to confirm.
- **Audits:** This software is currently in active development. While robustly tested, it has not yet undergone a formal third-party security audit. Use in high-stakes production environments at your own discretion.
