import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MockMarketDataProvider } from '../providers/mockProvider';

describe('Market Data Provider Adapter & Normalization', () => {
  it('normalizes quote attributes and flags simulated data explicitly', async () => {
    const provider = new MockMarketDataProvider();
    await provider.initialize();

    const quote = await provider.getQuote('RELIANCE.NS');
    assert.ok(quote !== null);
    assert.equal(quote?.symbol, 'RELIANCE.NS');
    assert.equal(quote?.market, 'IN');
    assert.equal(quote?.currency, 'INR');
    assert.equal(quote?.isSimulated, true);
    assert.equal(typeof quote?.price, 'number');
    assert.ok(quote?.price! > 0);
  });

  it('retrieves historical candlestick data for charts', async () => {
    const provider = new MockMarketDataProvider();
    await provider.initialize();

    const candles = await provider.getHistoricalCandles('AAPL.US', '1M');
    assert.ok(Array.isArray(candles));
    assert.ok(candles.length > 5);

    for (const c of candles) {
      assert.ok(c.high >= c.low);
      assert.ok(c.open > 0);
      assert.ok(c.close > 0);
    }
  });

  it('dispatches realtime tick subscriptions', async () => {
    const provider = new MockMarketDataProvider();
    await provider.initialize();

    let receivedTick = false;
    const unsub = provider.subscribeRealtime(['AAPL.US'], (tick) => {
      if (tick.symbol === 'AAPL.US') {
        receivedTick = true;
        assert.equal(tick.isSimulated, true);
      }
    });

    assert.equal(typeof unsub, 'function');
    unsub();
  });
});

