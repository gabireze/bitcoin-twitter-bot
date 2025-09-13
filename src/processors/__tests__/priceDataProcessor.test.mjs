import { getCurrentPrice, getPriceChange1h, getPriceChange24h } from '../priceDataProcessor.mjs';
import { ValidationError } from '../../utils/errors.mjs';

describe('priceDataProcessor', () => {
  const mockPriceData = {
    prices: [
      [1640995200000, 46000.0], // Start price
      [1640995500000, 46100.0],
      [1640995800000, 46200.0],
      [1640996100000, 46300.0],
      [1640996400000, 46400.0],
      [1640996700000, 46500.0],
      [1640997000000, 46600.0],
      [1640997300000, 46700.0],
      [1640997600000, 46800.0],
      [1640997900000, 46900.0],
      [1640998200000, 47000.0],
      [1640998500000, 47100.0],
      [1640998800000, 47200.0], // 1h ago (index 12)
      [1640999100000, 47300.0], // Current (index 13)
    ],
    market_caps: [[1640999100000, 890000000000]],
    total_volumes: [[1640999100000, 25000000000]],
  };

  describe('getCurrentPrice', () => {
    it('should return formatted current price', () => {
      const result = getCurrentPrice(mockPriceData);
      expect(result).toBe('$47,300.00');
    });

    it('should throw ValidationError for invalid data', () => {
      expect(() => getCurrentPrice(null)).toThrow(ValidationError);
      expect(() => getCurrentPrice({})).toThrow(ValidationError);
      expect(() => getCurrentPrice({ prices: [] })).toThrow(ValidationError);
    });
  });

  describe('getPriceChange1h', () => {
    it('should calculate 1h price change correctly', () => {
      const result = getPriceChange1h(mockPriceData);
      // (47300 - 47200) / 47200 * 100 = 0.21%
      expect(result).toBe('0.21%');
    });

    it('should throw ValidationError for insufficient data', () => {
      const insufficientData = {
        ...mockPriceData,
        prices: mockPriceData.prices.slice(0, 5), // Less than 12 intervals
      };
      expect(() => getPriceChange1h(insufficientData)).toThrow(ValidationError);
    });
  });

  describe('getPriceChange24h', () => {
    it('should calculate 24h price change correctly', () => {
      const result = getPriceChange24h(mockPriceData);
      // (47300 - 46000) / 46000 * 100 = 2.83%
      expect(result).toBe('2.83%');
    });
  });
});
