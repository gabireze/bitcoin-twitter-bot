import { createHourlyPriceUpdate, createDailyPriceUpdate } from '../priceMessages.mjs';

describe('priceMessages', () => {
  const mockPriceData = {
    prices: [
      [1640995200000, 46000.00],
      [1640995500000, 46100.00],
      [1640995800000, 46200.00],
      [1640996100000, 46300.00],
      [1640996400000, 46400.00],
      [1640996700000, 46500.00],
      [1640997000000, 46600.00],
      [1640997300000, 46700.00],
      [1640997600000, 46800.00],
      [1640997900000, 46900.00],
      [1640998200000, 47000.00],
      [1640998500000, 47100.00],
      [1640998800000, 47200.00],
      [1640999100000, 47300.00],
    ],
    market_caps: [
      [1640995200000, 870000000000],
      [1640999100000, 890000000000]
    ],
    total_volumes: [
      [1640995200000, 24000000000],
      [1640999100000, 25000000000]
    ]
  };

  describe('createHourlyPriceUpdate', () => {
    it('should create hourly price update message', () => {
      const result = createHourlyPriceUpdate(mockPriceData);
      
      expect(result).toContain('#Bitcoin is currently trading at:');
      expect(result).toContain('$47,300.00');
      expect(result).toContain('0.21%');
    });
  });

  describe('createDailyPriceUpdate', () => {
    it('should create daily price update message', () => {
      const result = createDailyPriceUpdate(mockPriceData);
      
      expect(result).toContain('#Bitcoin 24h Update');
      expect(result).toContain('Current Price:');
      expect(result).toContain('$47,300.00');
      expect(result).toContain('Market Cap:');
      expect(result).toContain('Volume:');
    });
  });
});
