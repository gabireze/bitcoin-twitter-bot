import { formatCurrency, calculatePercentageChange, formatDate } from '../formatUtils.mjs';

describe('formatUtils', () => {
  describe('formatCurrency', () => {
    it('should format numbers as USD currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should throw error for invalid input', () => {
      expect(() => formatCurrency('invalid')).toThrow('Invalid number for currency formatting');
      expect(() => formatCurrency(NaN)).toThrow('Invalid number for currency formatting');
      expect(() => formatCurrency(null)).toThrow('Invalid number for currency formatting');
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate percentage change correctly', () => {
      expect(calculatePercentageChange(110, 100)).toBe(10);
      expect(calculatePercentageChange(90, 100)).toBe(-10);
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });

    it('should throw error when previous value is zero', () => {
      expect(() => calculatePercentageChange(100, 0)).toThrow('Cannot calculate percentage change: previous value is zero');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly with ordinal suffixes', () => {
      const date1 = new Date('2024-01-01');
      expect(formatDate(date1)).toBe('Jan 1st, 2024');

      const date2 = new Date('2024-01-02');
      expect(formatDate(date2)).toBe('Jan 2nd, 2024');

      const date3 = new Date('2024-01-03');
      expect(formatDate(date3)).toBe('Jan 3rd, 2024');

      const date4 = new Date('2024-01-04');
      expect(formatDate(date4)).toBe('Jan 4th, 2024');

      const date21 = new Date('2024-01-21');
      expect(formatDate(date21)).toBe('Jan 21st, 2024');
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-12-25');
      expect(result).toBe('Dec 25th, 2024');
    });

    it('should throw error for invalid dates', () => {
      expect(() => formatDate(null)).toThrow('Invalid date provided');
      expect(() => formatDate('invalid')).toThrow('Invalid date provided');
    });
  });
});
