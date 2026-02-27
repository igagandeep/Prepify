# Security Policy

## Supported Versions

Prepify is in active development. Security fixes are applied to the latest version only.

| Version | Supported |
|---|---|
| Latest (main/development) | ✅ |
| Older commits | ❌ |

## Reporting a Vulnerability

If you discover a security vulnerability in Prepify, please **do not open a public GitHub issue**.

Instead, report it privately by emailing: **[igagandeep95@gmail.com]**

### What to include

- A description of the vulnerability
- Steps to reproduce it
- The potential impact
- Any suggested fix (optional)

### What to expect

- You will receive an acknowledgement within **48 hours**
- We will investigate and aim to release a fix within **7 days** for critical issues
- You will be credited in the fix if you wish

## Scope

Since Prepify runs **locally on your machine** by default, the attack surface is limited. However, please report:

- Vulnerabilities in the Express.js backend API
- Issues with the Chrome extension that could expose user data
- XSS or injection vulnerabilities in the frontend
- Any issue in the hosted demo at [https://prepify-rho.vercel.app](https://prepify-rho.vercel.app)

## Out of Scope

- Vulnerabilities in third-party dependencies (report those upstream)
- Issues that require physical access to the user's machine
