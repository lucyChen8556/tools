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

const subscriptionDefaults = {
  price: '19.99',
  billingCycle: 'monthly' as BillingCycle,
  seats: '3',
  splitBy: '3',
  discountPercent: '0',
  currency: '$',
  minimumSeats: 1,
  minimumPeople: 1,
};

function calculateSubscription(input: SubscriptionInput) {
  const enteredPrice = Math.max(0, readNumber(input.price));
  const seatCount = Math.max(subscriptionDefaults.minimumSeats, readNumber(input.seats, subscriptionDefaults.minimumSeats));
  const people = Math.max(subscriptionDefaults.minimumPeople, readNumber(input.splitBy, subscriptionDefaults.minimumPeople));
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

export { billingOptions, calculateSubscription, subscriptionDefaults };
export type { BillingCycle };
