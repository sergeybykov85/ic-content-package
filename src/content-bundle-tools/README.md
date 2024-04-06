# content-bundle-tool

Created on Node.js 18

### Technologies

- TypeScript
- React & React Router
- Vite & Vitest
- ESLint & Prettier
- SCSS

## Deployment
Steps to deploy front-end canister

0. You'll need to install `Node.js` not lower than version 18

1. Pull the **Internet Identity** canister using dfx deps:
```
dfx deps pull
```
2. Initialize the **Internet Identity** canister:
```
dfx deps init internet_identity --argument '(null)'
```
3. Deploy the **Internet Identity** canister:
```
dfx deps deploy
```
4. Generate IDL files:
```
dfx generate
```
5. Set canister IDs in the .env file

6. Deploy the **content-bundle-tools** canister:
```
dfx deploy content-bundle-tools
```
