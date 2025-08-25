export const calculatePercentageChange = (currentValue, previousValue) => {
  if (previousValue === 0) {
    throw new Error('Cannot calculate percentage change: previous value is zero');
  }
  return ((currentValue - previousValue) / previousValue) * 100;
};

export const formatCurrency = value => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Invalid number for currency formatting');
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export const formatDate = date => {
  if (!date || (!(date instanceof Date) && !Date.parse(date))) {
    throw new Error('Invalid date provided');
  }

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  };

  const dateObj = date instanceof Date ? date : new Date(date);
  const dateString = dateObj.toLocaleDateString('en-US', options);
  const dayOfMonth = dateObj.getDate();
  let daySuffix;

  if (dayOfMonth > 3 && dayOfMonth < 21) {
    daySuffix = 'th';
  } else if (dayOfMonth % 10 === 1) {
    daySuffix = 'st';
  } else if (dayOfMonth % 10 === 2) {
    daySuffix = 'nd';
  } else if (dayOfMonth % 10 === 3) {
    daySuffix = 'rd';
  } else {
    daySuffix = 'th';
  }

  return dateString.replace(new RegExp(' ' + dayOfMonth), ` ${dayOfMonth}${daySuffix}`);
};
