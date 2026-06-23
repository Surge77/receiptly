// Labeled OCR fixture set. Each `raw` is text as ML Kit would emit it; `expected`
// is the ground truth we score the parser against. This drives the headline
// amount-extraction accuracy metric (see receipt-parser.test.ts).

export interface ReceiptFixture {
  name: string;
  raw: string;
  expected: {
    amountMinor: number | null;
    date: string | null;
    merchant: string | null;
  };
}

export const RECEIPT_FIXTURES: ReceiptFixture[] = [
  {
    name: 'swiggy food order',
    raw: 'Swiggy\nOrder #1234\nItem total 420.00\nDelivery 30.00\nGrand Total ₹450.00\n12/05/2024',
    expected: { amountMinor: 45000, date: '2024-05-12', merchant: 'Swiggy' },
  },
  {
    name: 'dmart groceries',
    raw: 'DMart\nReliance Retail\nMilk 56.00\nBread 40.00\nTotal Amount 96.00\nDate: 03/06/2024',
    expected: { amountMinor: 9600, date: '2024-06-03', merchant: 'DMart' },
  },
  {
    name: 'big bazaar with rupee symbol',
    raw: 'Big Bazaar\nGSTIN 27ABCDE\nSubtotal ₹1,200.00\nTotal ₹1,249.50\n15-04-2024',
    expected: { amountMinor: 124950, date: '2024-04-15', merchant: 'Big Bazaar' },
  },
  {
    name: 'cafe coffee day',
    raw: 'Cafe Coffee Day\nCappuccino 180\nTotal: Rs.180.00\n01.02.2024',
    expected: { amountMinor: 18000, date: '2024-02-01', merchant: 'Cafe Coffee Day' },
  },
  {
    name: 'apollo pharmacy',
    raw: 'Apollo Pharmacy\nInvoice No 9981\nNet Amount 345.50\n22/11/2023',
    expected: { amountMinor: 34550, date: '2023-11-22', merchant: 'Apollo Pharmacy' },
  },
  {
    name: 'uber ride',
    raw: 'Uber\nTrip fare 210.00\nTotal ₹210.00\nDate 2024-07-09',
    expected: { amountMinor: 21000, date: '2024-07-09', merchant: 'Uber' },
  },
  {
    name: 'amazon delivery',
    raw: 'Amazon\nOrder summary\nGrand Total Rs. 2,499.00\n05 Jan 2024',
    expected: { amountMinor: 249900, date: '2024-01-05', merchant: 'Amazon' },
  },
  {
    name: 'restaurant no keyword fallback',
    raw: 'Paradise Biryani\nChicken Biryani 320.00\nWater 20.00\n340.00\n18/03/2024',
    expected: { amountMinor: 34000, date: '2024-03-18', merchant: 'Paradise Biryani' },
  },
  {
    name: 'mobile recharge bill',
    raw: 'Jio Recharge\nPlan 299\nAmount Payable ₹299.00\n10/10/2024',
    expected: { amountMinor: 29900, date: '2024-10-10', merchant: 'Jio Recharge' },
  },
  {
    name: 'pvr cinema',
    raw: 'PVR Cinemas\nTicket x2\nBalance 600.00\n28-09-2024',
    expected: { amountMinor: 60000, date: '2024-09-28', merchant: 'PVR Cinemas' },
  },
  {
    name: 'petrol pump',
    raw: 'Indian Oil\nPetrol\nTotal Amount: 1000.00\n14/08/2024',
    expected: { amountMinor: 100000, date: '2024-08-14', merchant: 'Indian Oil' },
  },
  {
    name: 'myntra shopping',
    raw: 'Myntra\nT-Shirt 799.00\nDiscount -100.00\nGrand Total 699.00\n2024-12-01',
    expected: { amountMinor: 69900, date: '2024-12-01', merchant: 'Myntra' },
  },
];
