import { syncAllRealMarketQuotes } from '../services/realQuoteSync.js';

async function main() {
  await syncAllRealMarketQuotes();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
