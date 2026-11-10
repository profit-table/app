/*
 * MOCK DATA — everything here is invented. No real restaurants, suppliers or prices.
 *
 * catalog:   what the membership knows about a product (the pooled side).
 * locations: what one restaurant location buys and pays (the member's side).
 */
window.mockData = {
    minMembers: 5, // a benchmark is only shown when at least this many restaurants buy the product

    peerGroup: {restaurants: 38, region: 'Metro region', segment: 'casual dining', window: 'last 90 days'},

    user: {name: 'Sam Rivera', role: 'Owner', plan: 'Member'},

    team: [
        {name: 'Sam Rivera', role: 'Owner', you: true},
        {name: 'Priya Nair', role: 'Kitchen manager'},
        {name: 'Marco Bell', role: 'Bookkeeper'},
        {name: 'Jo Tanaka', role: 'Receiving', pending: true}
    ],

    catalog: {
        wings:      {name: 'Chicken wings, jumbo', unit: 'kg', avg: 8.70, avgFrom: 8.40, min: 7.90, max: 10.40, members: 23},
        oil:        {name: 'Fryer oil, canola', unit: 'L', avg: 3.02, avgFrom: 3.08, min: 2.70, max: 3.60, members: 31},
        beef:       {name: 'Ground beef 80/20', unit: 'kg', avg: 10.85, avgFrom: 10.60, min: 9.90, max: 12.10, members: 27},
        fries:      {name: 'French fries 3/8", frozen', unit: 'kg', avg: 3.10, avgFrom: 3.05, min: 2.80, max: 3.55, members: 29},
        mozzarella: {name: 'Mozzarella, shredded', unit: 'kg', avg: 10.55, avgFrom: 10.30, min: 9.60, max: 11.80, members: 19},
        romaine:    {name: 'Romaine hearts', unit: 'case', avg: 34.00, avgFrom: 31.50, min: 29.00, max: 41.00, members: 14},
        containers: {name: 'Takeout containers 9×9', unit: 'case', avg: 41.50, avgFrom: 41.00, min: 36.00, max: 49.00, members: 12},
        keg:        {name: 'Draft lager, 58.6 L keg', unit: 'keg', avg: 192.00, avgFrom: 188.00, min: 179.00, max: 205.00, members: 9},
        salmon:     {name: 'Atlantic salmon fillet', unit: 'kg', avg: 21.90, avgFrom: 22.40, min: 19.80, max: 26.00, members: 11},
        eggs:       {name: 'Eggs, large', unit: 'case', avg: 55.40, avgFrom: 57.00, min: 50.00, max: 61.00, members: 26},
        hotsauce:   {name: 'House hot sauce, 4 L', unit: 'jug', avg: null, avgFrom: null, min: null, max: null, members: 3}
    },

    locations: {
        harbour: {
            name: 'Harbour Street Grill',
            months: [
                {label: 'Jun', spend: 18200, over: 540},
                {label: 'Jul', spend: 19600, over: 610},
                {label: 'Aug', spend: 21100, over: 720},
                {label: 'Sep', spend: 20400, over: 690},
                {label: 'Oct', spend: 19800, over: 660},
                {label: 'Nov', spend: 7900, over: 270, partial: true}
            ],
            buys: [
                {pid: 'wings', you: 9.80, from: 8.90, annualQty: 2600, supplier: 'Northgate Foodservice', printed: ['CHX WING JMB 40LB', 'WINGS PARTY 2/5KG']},
                {pid: 'oil', you: 3.45, from: 3.20, annualQty: 3100, supplier: 'Northgate Foodservice', printed: ['OIL CANOLA FRY 16L']},
                {pid: 'beef', you: 11.45, from: 10.90, annualQty: 1900, supplier: 'Northgate Foodservice', printed: ['BEEF GRND 80/20 4/2.27KG']},
                {pid: 'fries', you: 2.95, from: 2.95, annualQty: 4200, supplier: 'Northgate Foodservice', printed: ['FRIES 3/8 SC 6/2.27KG']},
                {pid: 'mozzarella', you: 10.60, from: 10.20, annualQty: 900, supplier: 'Northgate Foodservice', printed: ['MOZZ SHRD 4/2.27KG']},
                {pid: 'romaine', you: 38.50, from: 33.00, annualQty: 150, supplier: 'Bayline Produce', printed: ['ROMAINE HRTS 12CT']},
                {pid: 'containers', you: 46.00, from: 44.00, annualQty: 60, supplier: 'Northgate Foodservice', printed: ['CONT HNGD 9X9 200CT']},
                {pid: 'keg', you: 189.00, from: 186.00, annualQty: 110, supplier: 'Two Rivers Beverage', printed: ['LAGER DRAFT 58.6L']},
                {pid: 'salmon', you: 24.80, from: 23.10, annualQty: 520, supplier: 'Coastal Seafood Co.', printed: ['SALMON ATL FIL SKON']},
                {pid: 'eggs', you: 52.00, from: 55.00, annualQty: 140, supplier: 'Bayline Produce', printed: ['EGGS LG 15DZ']},
                {pid: 'hotsauce', you: 28.00, from: 27.00, annualQty: 48, supplier: 'Pepper Lab', printed: ['HOT SAUCE HOUSE 4L']}
            ],
            invoices: [
                {
                    id: 'h-1107', date: '2026-11-07', supplier: 'Northgate Foodservice', number: 'INV 448213', pages: 2,
                    items: [
                        {pid: 'wings', printed: 'CHX WING JMB 40LB', packs: 3, perPack: 18.14},
                        {pid: 'oil', printed: 'OIL CANOLA FRY 16L', packs: 4, perPack: 16},
                        {pid: 'fries', printed: 'FRIES 3/8 SC 6/2.27KG', packs: 5, perPack: 13.62},
                        {pid: 'beef', printed: 'BEEF GRND 80/20 4/2.27KG', packs: 4, perPack: 9.08},
                        {printed: 'FUEL SURCHARGE', amount: 12.50}
                    ]
                },
                {
                    id: 'h-1105', date: '2026-11-05', supplier: 'Coastal Seafood Co.', number: '77120', pages: 1,
                    items: [{pid: 'salmon', printed: 'SALMON ATL FIL SKON', packs: 1, perPack: 10}]
                },
                {
                    id: 'h-1103', date: '2026-11-03', supplier: 'Bayline Produce', number: 'B-20931', pages: 1,
                    items: [
                        {pid: 'romaine', printed: 'ROMAINE HRTS 12CT', packs: 3, perPack: 1},
                        {pid: 'eggs', printed: 'EGGS LG 15DZ', packs: 3, perPack: 1}
                    ]
                },
                {
                    id: 'h-1030', date: '2026-10-30', supplier: 'Two Rivers Beverage', number: 'TR-5518', pages: 1,
                    items: [{pid: 'keg', printed: 'LAGER DRAFT 58.6L', packs: 2, perPack: 1}]
                },
                {
                    id: 'h-1028', date: '2026-10-28', supplier: 'Northgate Foodservice', number: 'INV 446870', pages: 2,
                    items: [
                        {pid: 'wings', printed: 'WINGS PARTY 2/5KG', packs: 5, perPack: 10},
                        {pid: 'mozzarella', printed: 'MOZZ SHRD 4/2.27KG', packs: 2, perPack: 9.08},
                        {pid: 'containers', printed: 'CONT HNGD 9X9 200CT', packs: 1, perPack: 1},
                        {pid: 'hotsauce', printed: 'HOT SAUCE HOUSE 4L', packs: 4, perPack: 1}
                    ]
                }
            ],
            // What the camera "reads" when you capture pages in the mock.
            incoming: {
                id: 'h-1110', date: '2026-11-10', supplier: 'Northgate Foodservice', number: 'INV 449002',
                items: [
                    {pid: 'wings', printed: 'CHX WING JMB 40LB', packs: 2, perPack: 18.14},
                    {pid: 'oil', printed: 'OIL CANOLA FRY 16L', packs: 3, perPack: 16},
                    {pid: 'mozzarella', printed: 'MOZZ SHRD 4/2.27KG', packs: 2, perPack: 9.08, check: 'Pack size read as 4 × 2.27 kg. The print was faint.'}
                ]
            }
        },

        dockside: {
            name: 'Harbour Dockside',
            months: [
                {label: 'Jun', spend: 9800, over: 250},
                {label: 'Jul', spend: 11200, over: 300},
                {label: 'Aug', spend: 12900, over: 390},
                {label: 'Sep', spend: 11700, over: 340},
                {label: 'Oct', spend: 10600, over: 310},
                {label: 'Nov', spend: 3900, over: 120, partial: true}
            ],
            buys: [
                {pid: 'salmon', you: 25.40, from: 23.80, annualQty: 800, supplier: 'Coastal Seafood Co.', printed: ['SALMON ATL FIL SKON']},
                {pid: 'fries', you: 3.42, from: 3.20, annualQty: 3000, supplier: 'Westmark Supply', printed: ['FRY STR CUT 3/8 13.6KG']},
                {pid: 'wings', you: 8.95, from: 8.60, annualQty: 1100, supplier: 'Westmark Supply', printed: ['WING CHKN JUMBO 18KG']},
                {pid: 'oil', you: 3.10, from: 3.12, annualQty: 2200, supplier: 'Westmark Supply', printed: ['CANOLA FRY OIL 16L']},
                {pid: 'romaine', you: 33.00, from: 31.00, annualQty: 90, supplier: 'Bayline Produce', printed: ['ROMAINE HRTS 12CT']},
                {pid: 'eggs', you: 55.00, from: 56.50, annualQty: 70, supplier: 'Bayline Produce', printed: ['EGGS LG 15DZ']}
            ],
            invoices: [
                {
                    id: 'd-1106', date: '2026-11-06', supplier: 'Westmark Supply', number: 'WM-88410', pages: 1,
                    items: [
                        {pid: 'fries', printed: 'FRY STR CUT 3/8 13.6KG', packs: 6, perPack: 13.6},
                        {pid: 'wings', printed: 'WING CHKN JUMBO 18KG', packs: 1, perPack: 18},
                        {pid: 'oil', printed: 'CANOLA FRY OIL 16L', packs: 3, perPack: 16}
                    ]
                },
                {
                    id: 'd-1104', date: '2026-11-04', supplier: 'Coastal Seafood Co.', number: '77098', pages: 1,
                    items: [{pid: 'salmon', printed: 'SALMON ATL FIL SKON', packs: 2, perPack: 10}]
                }
            ],
            incoming: {
                id: 'd-1110', date: '2026-11-10', supplier: 'Coastal Seafood Co.', number: '77161',
                items: [
                    {pid: 'salmon', printed: 'SALMON ATL FIL SKON', packs: 2, perPack: 10, check: 'Weight read as 10.0 kg per case. The total did not add up exactly.'}
                ]
            }
        }
    }
};
