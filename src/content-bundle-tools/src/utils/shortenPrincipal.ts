export default function shortenPrincipal(principal: string): string {
  return `${principal.slice(0, 5)}...${principal.slice(principal.length - 3)}`
}
