// Vyapar AI — Demo data for Mehta Traders (fictional lubricant distributor)

const BUSINESS = {
  name: "Mehta Traders",
  category: "Lubricant Distributor",
  city: "Pune",
  owner: "Mehta ji"
};

const CUSTOMERS = [
  { id: 1, name: "Rajesh Auto Garage",       phone: "+91 99999 00001", location: "Pune"   },
  { id: 2, name: "Sharma Transport",         phone: "+91 99999 00002", location: "Pune"   },
  { id: 3, name: "Patel Motor Works",        phone: "+91 99999 00003", location: "Mumbai" },
  { id: 4, name: "Verma Industries",         phone: "+91 99999 00004", location: "Pune"   },
  { id: 5, name: "Singh Tractor Service",    phone: "+91 99999 00005", location: "Nashik" },
  { id: 6, name: "Gupta Spare Parts",        phone: "+91 99999 00006", location: "Pune"   },
  { id: 7, name: "Mehra Workshop",           phone: "+91 99999 00007", location: "Mumbai" },
  { id: 8, name: "Joshi Truck Services",     phone: "+91 99999 00008", location: "Pune"   },
  { id: 9, name: "Reddy Bus Service",        phone: "+91 99999 00009", location: "Mumbai" },
  { id: 10, name: "Nair Petrol Pump",        phone: "+91 99999 00010", location: "Nashik" }
];

const ORDERS = [
  { id: 101, customerId: 1, product: "Castrol CRB Turbomax 20L x 6", amount: 18500, paid: 0,     dueDate: "2026-05-27", billNo: "MT1001" },
  { id: 102, customerId: 2, product: "Servo Pride 4T 1L x 24",       amount: 8400,  paid: 0,     dueDate: "2026-05-28", billNo: "MT1002" },
  { id: 103, customerId: 3, product: "Gulf Superfleet XLE 15W-40 20L x 4", amount: 14200, paid: 0, dueDate: "2026-05-22", billNo: "MT1003" }, // OVERDUE
  { id: 104, customerId: 4, product: "Castrol Magnatec 5W-30 4L x 6", amount: 12500, paid: 0,    dueDate: "2026-05-30", billNo: "MT1004" },
  { id: 105, customerId: 5, product: "Servo Mileage Plus 20W-40 15L x 4", amount: 9800,  paid: 0,    dueDate: "2026-05-27", billNo: "MT1005" }, // URGENT
  { id: 106, customerId: 6, product: "Castrol GTX Magna 20W-40 5L x 8", amount: 7200,  paid: 0,     dueDate: "2026-05-26", billNo: "MT1006" }, // TODAY
  { id: 107, customerId: 7, product: "Mobil Delvac MX 15W-40 20L x 3", amount: 11500, paid: 11500, dueDate: "2026-05-23", billNo: "MT1007" }, // PAID
  { id: 108, customerId: 8, product: "Castrol RX Diesel 20W-40 20L x 5", amount: 15600, paid: 0,   dueDate: "2026-05-31", billNo: "MT1008" },
  { id: 109, customerId: 9, product: "Shell Rimula R4 X 20L x 6",       amount: 19200, paid: 0,   dueDate: "2026-06-01", billNo: "MT1009" },
  { id: 110, customerId: 10, product: "Gulf Supreme Duty XLE 15W-40 20L x 2", amount: 7100, paid: 7100, dueDate: "2026-05-24", billNo: "MT1010" } // PAID
];