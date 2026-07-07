import { readNumber } from '../../utils/numberFormat';

const billingOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
] as const;

type BillingCycle = (typeof billingOptions)[number]['value'];

type SubscriptionInput = {
  price: string;
  billingCycle: BillingCycle;
  seats: string;
  splitBy: string;
  discountPercent: string;
};

function calculateSubscription(input: SubscriptionInput) {
  const enteredPrice = Math.max(0, readNumber(input.price));
  const seatCount = Math.max(1, readNumber(input.seats, 1));
  const people = Math.max(1, readNumber(input.splitBy, 1));
  const discountRate = Math.max(0, readNumber(input.discountPercent)) / 100;
  const periodTotal = enteredPrice * seatCount * (1 - discountRate);
  const monthlyTotal = input.billingCycle === 'monthly' ? periodTotal : periodTotal / 12;
  const yearlyTotal = input.billingCycle === 'monthly' ? periodTotal * 12 : periodTotal;

  return {
    periodTotal,
    monthlyTotal,
    yearlyTotal,
    dailyTotal: yearlyTotal / 365,
    monthlyPerPerson: monthlyTotal / people,
    yearlyPerPerson: yearlyTotal / people,
    perSeatMonthly: monthlyTotal / seatCount,
    savings: enteredPrice * seatCount - periodTotal,
    people,
    seatCount,
  };
}

export { billingOptions, calculateSubscription };
export type { BillingCycle };
