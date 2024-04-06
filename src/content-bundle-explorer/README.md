# content-bundle-explorer

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
1. Generate IDL files:
```
dfx generate
```
2. Set canister IDs in the .env file

3. Deploy the **content-bundle-widget** canister:
```
dfx deploy content-bundle-widget
```