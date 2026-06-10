/**
 * CarbonLedger — Carbon Data Service
 * Emission factors (kg CO₂e per unit) sourced from EPA / DEFRA / IPCC averages.
 */

// ── Emission Factors ──────────────────────────────────────────────────────────

export const EMISSION_FACTORS = {
  // Transport (kg CO₂ per km)
  transport: {
    car_small: 0.142,
    car_medium: 0.192,
    car_large: 0.281,
    car_suv: 0.31,
    car_ev: 0.053,
    motorcycle: 0.114,
    bus: 0.089,
    train: 0.041,
    subway: 0.028,
    bicycle: 0,
    walking: 0,
    flight_domestic: 0.255, // per km (includes radiative forcing)
    flight_short: 0.195,
    flight_long: 0.147,
    taxi_rideshare: 0.21,
  },

  // Food (kg CO₂ per serving or kg)
  food: {
    beef: 6.61, // per 200g serving
    lamb: 4.9,
    pork: 2.42,
    chicken: 1.38,
    fish_farmed: 1.22,
    fish_wild: 0.82,
    eggs: 0.6, // per 2 eggs
    dairy_milk: 0.64, // per 250ml
    cheese: 2.7, // per 100g
    vegetables: 0.4, // per serving
    fruits: 0.43,
    rice: 0.87,
    pasta_bread: 0.32,
    tofu: 0.52,
    coffee: 0.21, // per cup
    beer: 0.49, // per bottle
  },

  // Energy (kg CO₂ per unit)
  energy: {
    electricity_kwh: 0.42, // global avg grid
    natural_gas_m3: 2.0,
    heating_oil_l: 2.52,
    lpg_kg: 2.98,
    coal_kg: 2.86,
  },

  // Shopping (kg CO₂ per item — lifecycle estimate)
  shopping: {
    tshirt: 5.5,
    jeans: 25.0,
    dress: 16.0,
    shoes: 14.0,
    jacket: 30.0,
    smartphone: 70.0,
    laptop: 300.0,
    tablet: 100.0,
    tv_50in: 400.0,
    furniture_sm: 80.0,
    furniture_lg: 200.0,
    book: 2.5,
    plastic_bag: 0.018,
  },

  // Lifestyle (kg CO₂ per day/unit)
  lifestyle: {
    hot_shower_min: 0.074, // per minute
    bath: 0.52,
    dishwasher_cycle: 0.756,
    laundry_load: 0.6,
    streaming_hr: 0.036,
    gaming_hr: 0.08,
    dog_per_day: 2.47,
    cat_per_day: 1.33,
  },
};

// ── Country / Region Baselines (kg CO₂ per day) ───────────────────────────────

export const COUNTRY_BASELINES = {
  global: 16.3,
  us: 44.0,
  eu: 18.5,
  uk: 15.0,
  india: 5.2,
  china: 19.8,
  brazil: 8.3,
};

// ── Quick-Log Presets ─────────────────────────────────────────────────────────

export const PRESETS = {
  transport: [
    { id: 'drive_5km', icon: '🚗', label: 'Short drive (5 km)', kgCO2: 0.96 },
    {
      id: 'drive_20km',
      icon: '🚗',
      label: 'Commute by car (20 km)',
      kgCO2: 3.84,
    },
    { id: 'drive_50km', icon: '🚗', label: 'Long drive (50 km)', kgCO2: 9.6 },
    { id: 'bus_30min', icon: '🚌', label: 'Bus ride (30 min)', kgCO2: 0.8 },
    { id: 'train_commute', icon: '🚆', label: 'Train commute', kgCO2: 0.62 },
    { id: 'rideshare', icon: '🚕', label: 'Rideshare / Uber', kgCO2: 2.1 },
    { id: 'bike', icon: '🚲', label: 'Biked instead', kgCO2: 0 },
    {
      id: 'flight_short',
      icon: '✈️',
      label: 'Short-haul flight',
      kgCO2: 195.0,
    },
    { id: 'flight_long', icon: '✈️', label: 'Long-haul flight', kgCO2: 441.0 },
  ],
  food: [
    { id: 'beef_meal', icon: '🥩', label: 'Beef meal', kgCO2: 6.61 },
    { id: 'chicken_meal', icon: '🍗', label: 'Chicken meal', kgCO2: 1.38 },
    { id: 'fish_meal', icon: '🐟', label: 'Fish meal', kgCO2: 1.22 },
    { id: 'veg_meal', icon: '🥗', label: 'Vegetarian meal', kgCO2: 0.4 },
    { id: 'vegan_meal', icon: '🌱', label: 'Vegan meal', kgCO2: 0.2 },
    { id: 'coffee', icon: '☕', label: 'Coffee', kgCO2: 0.21 },
    { id: 'cheeseburger', icon: '🍔', label: 'Cheeseburger', kgCO2: 5.5 },
    { id: 'pizza_slice', icon: '🍕', label: 'Pizza slice', kgCO2: 0.8 },
  ],
  energy: [
    {
      id: 'elec_5kwh',
      icon: '⚡',
      label: 'Home electricity (5 kWh)',
      kgCO2: 2.1,
    },
    {
      id: 'elec_10kwh',
      icon: '⚡',
      label: 'High energy day (10 kWh)',
      kgCO2: 4.2,
    },
    { id: 'hot_shower', icon: '🚿', label: 'Hot shower (10 min)', kgCO2: 0.74 },
    {
      id: 'long_shower',
      icon: '🚿',
      label: 'Long shower (20 min)',
      kgCO2: 1.48,
    },
    { id: 'laundry', icon: '👕', label: 'Laundry load', kgCO2: 0.6 },
    { id: 'dishwasher', icon: '🍽️', label: 'Dishwasher cycle', kgCO2: 0.76 },
    { id: 'heating_hr', icon: '🔥', label: 'Gas heating (1 hour)', kgCO2: 0.6 },
  ],
  shopping: [
    { id: 'tshirt', icon: '👕', label: 'T-shirt / top', kgCO2: 5.5 },
    { id: 'jeans', icon: '👖', label: 'Jeans / trousers', kgCO2: 25.0 },
    { id: 'shoes', icon: '👟', label: 'Shoes', kgCO2: 14.0 },
    { id: 'jacket', icon: '🧥', label: 'Jacket / coat', kgCO2: 30.0 },
    { id: 'smartphone', icon: '📱', label: 'New smartphone', kgCO2: 70.0 },
    { id: 'laptop', icon: '💻', label: 'New laptop', kgCO2: 300.0 },
    {
      id: 'online_order',
      icon: '📦',
      label: 'Online order (small)',
      kgCO2: 3.5,
    },
    { id: 'groceries', icon: '🛒', label: 'Grocery run', kgCO2: 2.8 },
  ],
};

// ── Challenge Packs ───────────────────────────────────────────────────────────

export const CHALLENGE_PACKS = [
  {
    id: 'green_week',
    title: 'Green Week',
    emoji: '🌿',
    duration: 7,
    totalSavingKg: 14.0,
    description: '7 days of eco-conscious choices',
    items: [
      { id: 'gw1', label: 'Walk or bike instead of driving', savingKg: 3.84 },
      { id: 'gw2', label: 'Eat a plant-based meal', savingKg: 6.21 },
      { id: 'gw3', label: 'Take a shower under 5 minutes', savingKg: 0.74 },
      { id: 'gw4', label: 'No single-use plastic today', savingKg: 0.2 },
      {
        id: 'gw5',
        label: 'Turn off lights when leaving a room',
        savingKg: 0.3,
      },
      { id: 'gw6', label: 'Batch errands into one trip', savingKg: 1.92 },
      {
        id: 'gw7',
        label: 'Cook at home instead of ordering out',
        savingKg: 1.5,
      },
    ],
  },
  {
    id: 'meatless_month',
    title: 'Meatless Month',
    emoji: '🥗',
    duration: 30,
    totalSavingKg: 45.0,
    description: 'Replace one meat meal per day',
    items: [
      { id: 'mm1', label: 'Replace beef with chicken or fish', savingKg: 5.23 },
      { id: 'mm2', label: 'Try a vegetarian recipe', savingKg: 6.21 },
      { id: 'mm3', label: 'Eat vegan for one full day', savingKg: 8.0 },
      { id: 'mm4', label: 'Swap dairy milk for plant milk', savingKg: 1.2 },
      { id: 'mm5', label: 'Make a meal from leftovers', savingKg: 2.1 },
    ],
  },
  {
    id: 'commute_shift',
    title: 'Commute Shift',
    emoji: '🚲',
    duration: 14,
    totalSavingKg: 53.0,
    description: '2 weeks of greener commuting',
    items: [
      {
        id: 'cs1',
        label: 'Take public transit instead of driving',
        savingKg: 3.3,
      },
      { id: 'cs2', label: 'Cycle or walk to work', savingKg: 3.84 },
      { id: 'cs3', label: 'Work from home today', savingKg: 3.84 },
      { id: 'cs4', label: 'Carpool with a colleague', savingKg: 1.92 },
      { id: 'cs5', label: 'Try a new transit route', savingKg: 3.3 },
    ],
  },
  {
    id: 'energy_saver',
    title: 'Energy Saver',
    emoji: '⚡',
    duration: 7,
    totalSavingKg: 20.0,
    description: 'Cut home energy for 7 days',
    items: [
      { id: 'es1', label: 'Wash clothes in cold water', savingKg: 0.4 },
      {
        id: 'es2',
        label: 'Air-dry laundry instead of tumble dry',
        savingKg: 2.4,
      },
      { id: 'es3', label: 'Lower thermostat by 2°C', savingKg: 0.86 },
      { id: 'es4', label: 'Unplug devices on standby', savingKg: 0.25 },
      { id: 'es5', label: 'Use energy-saving mode on devices', savingKg: 0.15 },
      {
        id: 'es6',
        label: 'Cook with the lid on (saves energy)',
        savingKg: 0.1,
      },
      { id: 'es7', label: 'Switch to LED bulbs', savingKg: 0.5 },
    ],
  },
];

// ── Onboarding Questions ──────────────────────────────────────────────────────

export const ONBOARDING_QUESTIONS = [
  {
    id: 'transport',
    step: 1,
    emoji: '🚗',
    title: 'How do you get around?',
    subtitle: 'Pick your primary mode of daily transport',
    options: [
      {
        id: 'walk_bike',
        icon: '🚲',
        label: 'Walk / Bike',
        value: 0,
        description: 'Most of my trips',
      },
      {
        id: 'transit',
        icon: '🚌',
        label: 'Public Transit',
        value: 0.89,
        description: 'Bus, metro or train',
      },
      {
        id: 'car_small',
        icon: '🚗',
        label: 'Small Car',
        value: 2.84,
        description: 'City car, hatchback',
      },
      {
        id: 'car_large',
        icon: '🚙',
        label: 'Large Car / SUV',
        value: 4.96,
        description: 'Sedan, SUV, truck',
      },
      {
        id: 'car_ev',
        icon: '⚡',
        label: 'Electric Car',
        value: 0.85,
        description: 'Full EV',
      },
    ],
  },
  {
    id: 'home',
    step: 2,
    emoji: '🏠',
    title: 'Tell us about your home',
    subtitle: 'Home energy is one of the biggest carbon sources',
    options: [
      {
        id: 'apartment_sm',
        icon: '🏢',
        label: 'Small Apartment',
        value: 1.2,
        description: 'Studio or 1-bed',
      },
      {
        id: 'apartment_lg',
        icon: '🏠',
        label: 'Large Apartment',
        value: 2.1,
        description: '2+ bedrooms',
      },
      {
        id: 'house_sm',
        icon: '🏡',
        label: 'Small House',
        value: 3.0,
        description: '2-3 bedrooms',
      },
      {
        id: 'house_lg',
        icon: '🏘️',
        label: 'Large House',
        value: 5.5,
        description: '4+ bedrooms',
      },
      {
        id: 'solar_home',
        icon: '☀️',
        label: 'Renewable Home',
        value: 0.5,
        description: 'Solar or green energy',
      },
    ],
  },
  {
    id: 'diet',
    step: 3,
    emoji: '🍽️',
    title: "What's your diet like?",
    subtitle: 'Food is a major carbon footprint driver',
    options: [
      {
        id: 'vegan',
        icon: '🌱',
        label: 'Vegan',
        value: 2.89,
        description: 'No animal products',
      },
      {
        id: 'vegetarian',
        icon: '🥗',
        label: 'Vegetarian',
        value: 3.81,
        description: 'No meat, some dairy',
      },
      {
        id: 'light_meat',
        icon: '🐔',
        label: 'Light Meat Eater',
        value: 5.63,
        description: 'Mostly chicken & fish',
      },
      {
        id: 'meat_lover',
        icon: '🥩',
        label: 'Meat Lover',
        value: 7.19,
        description: 'Regular beef & pork',
      },
      {
        id: 'heavy_meat',
        icon: '🍖',
        label: 'Meat Every Meal',
        value: 9.45,
        description: 'Meat at every meal',
      },
    ],
  },
  {
    id: 'shopping',
    step: 4,
    emoji: '🛒',
    title: 'How often do you shop?',
    subtitle: 'Fast fashion and gadgets add up quickly',
    options: [
      {
        id: 'minimal',
        icon: '♻️',
        label: 'Minimal',
        value: 0.5,
        description: 'Buy only necessities',
      },
      {
        id: 'secondhand',
        icon: '🏪',
        label: 'Secondhand',
        value: 0.8,
        description: 'Mostly thrift / resale',
      },
      {
        id: 'occasional',
        icon: '🛍️',
        label: 'Occasional',
        value: 1.5,
        description: 'New items every month',
      },
      {
        id: 'regular',
        icon: '🧢',
        label: 'Regular Shopper',
        value: 2.8,
        description: 'Weekly online orders',
      },
      {
        id: 'frequent',
        icon: '💳',
        label: 'Frequent Shopper',
        value: 4.5,
        description: 'New gadgets & clothes often',
      },
    ],
  },
  {
    id: 'lifestyle',
    step: 5,
    emoji: '🌿',
    title: 'Anything else about your life?',
    subtitle: 'Pets and habits count too',
    options: [
      {
        id: 'no_pets',
        icon: '🏠',
        label: 'No Pets',
        value: 0,
        description: 'Just me',
      },
      {
        id: 'cat',
        icon: '🐈',
        label: 'Cat Owner',
        value: 1.33,
        description: 'One or more cats',
      },
      {
        id: 'dog',
        icon: '🐕',
        label: 'Dog Owner',
        value: 2.47,
        description: 'One or more dogs',
      },
      {
        id: 'travel_often',
        icon: '✈️',
        label: 'Frequent Flyer',
        value: 3.0,
        description: '4+ flights per year',
      },
      {
        id: 'home_garden',
        icon: '🌻',
        label: 'Home Gardener',
        value: -0.5,
        description: 'Grow some of my food',
      },
    ],
  },
];

// ── Baseline Calculator ───────────────────────────────────────────────────────

/**
 * Calculate daily kg CO₂ baseline from onboarding answers
 * @param {Object} answers - { transport: 'car_large', home: 'house_sm', diet: 'meat_lover', shopping: 'regular', lifestyle: 'dog' }
 * @returns {number} Daily kg CO₂ estimate
 */
export function calculateBaseline(answers) {
  let total = 0;

  ONBOARDING_QUESTIONS.forEach((q) => {
    const selectedId = answers[q.id];
    if (!selectedId) return;
    const option = q.options.find((o) => o.id === selectedId);
    if (option) total += option.value;
  });

  // Add a small base (always-on emissions: standby power, water, etc.)
  total += 1.2;

  return Math.round(total * 10) / 10;
}

/**
 * Calculate annual CO₂ savings from switching a habit
 * @param {number} dailySavingKg - kg saved per day
 * @returns {{ annual: number, trees: number, flights: number }}
 */
export function calcSavings(dailySavingKg) {
  const annual = Math.round(dailySavingKg * 365);
  const trees = Math.round(annual / 21.7); // avg tree absorbs ~21.7 kg CO₂/yr
  const flights = Math.round((annual / 255) * 10) / 10; // avg short-haul ~255 kg CO₂
  return { annual, trees, flights };
}

/**
 * Get carbon budget from profile
 * @param {{ baseline: number, goalPercent: number }} profile
 * @returns {number} Daily budget in kg CO₂
 */
export function getDailyBudget(profile) {
  const reduction = profile.baseline * (profile.goalPercent / 100);
  return Math.round((profile.baseline - reduction) * 10) / 10;
}

/**
 * Category icon map
 */
export const CATEGORY_ICONS = {
  transport: '🚗',
  food: '🍔',
  energy: '⚡',
  shopping: '🛒',
  lifestyle: '🌿',
  other: '📊',
};
