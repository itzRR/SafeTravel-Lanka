import { Destination } from "./types";

// Historical risk events and cultural history for destinations
export const DESTINATION_HISTORY: Record<string, {
  culturalHistory: string;
  historicalEvents: { year: number; event: string; type: 'cultural' | 'disaster' | 'development' | 'milestone' }[];
  riskHistory: { year: number; month: string; type: string; severity: 'low' | 'moderate' | 'high' | 'critical'; description: string }[];
  safetyNotes: string[];
}> = {
  colombo: {
    culturalHistory: "Colombo has been a major trading port for over 2,000 years. Arab traders settled here in the 7th century, followed by Portuguese (1505), Dutch (1656), and British (1796) colonizers. The city became Sri Lanka's capital and commercial hub, growing from a small fishing village into a modern metropolis of over 5 million people.",
    historicalEvents: [
      { year: 1505, event: "Portuguese arrive and establish colonial rule", type: "milestone" },
      { year: 1656, event: "Dutch capture Colombo from Portuguese", type: "milestone" },
      { year: 1796, event: "British take control of Colombo", type: "milestone" },
      { year: 2004, event: "Indian Ocean Tsunami impacts coastal Colombo", type: "disaster" },
      { year: 2016, event: "Severe flooding in Colombo suburbs - Kelani River overflow", type: "disaster" },
      { year: 2019, event: "Colombo Lotus Tower completed - tallest structure in South Asia", type: "development" },
      { year: 2023, event: "Flash floods affect low-lying areas during monsoon season", type: "disaster" },
    ],
    riskHistory: [
      { year: 2024, month: "May", type: "Flood", severity: "high", description: "Southwest monsoon caused severe urban flooding in Colombo suburbs" },
      { year: 2024, month: "Nov", type: "Heavy Rain", severity: "moderate", description: "Northeast monsoon brought heavy rainfall, minor waterlogging" },
      { year: 2023, month: "Jun", type: "Flood", severity: "critical", description: "Kelani River overflow displaced thousands in low-lying areas" },
      { year: 2023, month: "Sep", type: "Heavy Rain", severity: "moderate", description: "Intermonsoon rainfall caused traffic disruptions" },
      { year: 2022, month: "May", type: "Flood", severity: "high", description: "Urban drainage failure during peak monsoon" },
      { year: 2021, month: "Jun", type: "Heavy Rain", severity: "low", description: "Moderate monsoon with controlled flooding" },
    ],
    safetyNotes: [
      "Colombo is prone to urban flooding during May-June monsoon season",
      "Low-lying areas near Kelani River face higher flood risk",
      "City has improved drainage systems since 2020 floods",
      "Tourist areas along Galle Face are generally safe year-round",
    ],
  },
  kandy: {
    culturalHistory: "Kandy was the last capital of the ancient kings of Sri Lanka, maintaining independence until 1815 when it fell to the British Empire. The city is home to the Temple of the Sacred Tooth Relic (Sri Dalada Maligawa), believed to house a tooth of Lord Buddha. The annual Esala Perahera festival, dating back to the 3rd century BC, is one of the oldest and grandest Buddhist festivals in the world.",
    historicalEvents: [
      { year: 1592, event: "Kandy becomes capital of the Kandyan Kingdom", type: "milestone" },
      { year: 1815, event: "Kandyan Convention - British take control", type: "milestone" },
      { year: 1988, event: "UNESCO designates Kandy as World Heritage Site", type: "milestone" },
      { year: 2003, event: "Landslide in surrounding hills displaces communities", type: "disaster" },
      { year: 2017, event: "Severe flooding and landslides in Kandy district", type: "disaster" },
      { year: 2024, event: "Temple of the Tooth restoration project completed", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "May", type: "Landslide", severity: "moderate", description: "Minor landslides on Hantana slopes during monsoon" },
      { year: 2023, month: "Jun", type: "Flood", severity: "moderate", description: "Mahaweli River water levels rose significantly" },
      { year: 2023, month: "Oct", type: "Heavy Rain", severity: "low", description: "Intermonsoon rainfall with minor disruptions" },
      { year: 2022, month: "May", type: "Landslide", severity: "high", description: "Major landslide near Kadugannawa blocked roads" },
      { year: 2021, month: "Jun", type: "Flood", severity: "moderate", description: "Flash floods in low-lying areas around Kandy Lake" },
    ],
    safetyNotes: [
      "Hill areas around Kandy are susceptible to landslides during heavy rain",
      "The city center around Kandy Lake is generally safe",
      "Esala Perahera season (July-August) sees large crowds - plan accordingly",
      "Mountain roads can be slippery during monsoon - drive carefully",
    ],
  },
  ella: {
    culturalHistory: "Ella has transformed from a quiet tea estate village into one of Sri Lanka's most beloved destinations. The name 'Ella' means 'waterfall' in Sinhalese. The iconic Nine Arch Bridge was built during British colonial rule in 1921 without using any steel - an engineering marvel constructed entirely from stone, bricks, and cement. The Ella Gap offers one of the most spectacular views in Sri Lanka, overlooking the southern plains 1,000 meters below.",
    historicalEvents: [
      { year: 1921, event: "Nine Arch Bridge constructed on Demodara railway line", type: "milestone" },
      { year: 2004, event: "Ella begins gaining international tourism recognition", type: "development" },
      { year: 2017, event: "Severe landslides in Badulla district near Ella", type: "disaster" },
      { year: 2019, event: "Ella becomes one of Asia's top trekking destinations", type: "milestone" },
      { year: 2023, event: "Ella-Demodara hiking trails improved with safety railings", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "Apr", type: "Landslide", severity: "moderate", description: "Minor rock slides near Little Adam's Peak trail" },
      { year: 2023, month: "May", type: "Heavy Rain", severity: "moderate", description: "Hiking trails temporarily closed due to slippery conditions" },
      { year: 2023, month: "Nov", type: "Landslide", severity: "high", description: "Landslide near Ella Rock blocked access trail" },
      { year: 2022, month: "Jun", type: "Heavy Rain", severity: "low", description: "Normal monsoon conditions, trails accessible" },
      { year: 2021, month: "May", type: "Landslide", severity: "critical", description: "Major landslide in nearby Koslanda area" },
    ],
    safetyNotes: [
      "Hiking trails can be dangerous during heavy rain - always check weather",
      "The Nine Arch Bridge area has no safety barriers - exercise extreme caution",
      "Train tracks are active - never walk on railway lines",
      "Best hiking conditions are January-March (dry season)",
    ],
  },
  sigiriya: {
    culturalHistory: "Sigiriya, the 'Lion Rock', was built by King Kashyapa I in the 5th century AD as a royal palace and fortress. Rising 200 meters above the jungle, it features ancient frescoes of celestial maidens, the Mirror Wall with ancient graffiti, and sophisticated water gardens that still function today. After Kashyapa's defeat in 495 AD, it became a Buddhist monastery until the 14th century. UNESCO designated it a World Heritage Site in 1982.",
    historicalEvents: [
      { year: 477, event: "King Kashyapa I builds the Lion Rock fortress", type: "milestone" },
      { year: 495, event: "Kashyapa defeated; Sigiriya becomes Buddhist monastery", type: "milestone" },
      { year: 1831, event: "British discover Sigiriya ruins during colonial survey", type: "milestone" },
      { year: 1982, event: "UNESCO World Heritage Site designation", type: "milestone" },
      { year: 2020, event: "Major restoration of ancient frescoes completed", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "Mar", type: "Heavy Rain", severity: "low", description: "Brief thunderstorms, rock climbing temporarily suspended" },
      { year: 2023, month: "May", type: "Heavy Rain", severity: "moderate", description: "Metal stairways slippery during monsoon rains" },
      { year: 2022, month: "Sep", type: "Heavy Rain", severity: "low", description: "Normal intermonsoon conditions" },
    ],
    safetyNotes: [
      "The climb is strenuous - carry water and start early morning",
      "Metal stairways become slippery in rain - rubber-soled shoes essential",
      "Wasp nests near the frescoes area can be dangerous during certain seasons",
      "Best visited during dry season (January-April) for clear views",
    ],
  },
  galle: {
    culturalHistory: "Galle Fort was first built by the Portuguese in 1588, then extensively fortified by the Dutch starting in 1649. It's the best-preserved European-style fort in South Asia and a UNESCO World Heritage Site since 1988. The fort has survived wars, earthquakes, and the 2004 tsunami. Today it's a vibrant cultural hub with boutique hotels, art galleries, and restaurants within its 36-hectare walled enclosure.",
    historicalEvents: [
      { year: 1588, event: "Portuguese build the first fort at Galle", type: "milestone" },
      { year: 1649, event: "Dutch capture and expand Galle Fort", type: "milestone" },
      { year: 1988, event: "UNESCO World Heritage Site designation", type: "milestone" },
      { year: 2004, event: "Indian Ocean Tsunami causes significant damage - 4,000+ casualties in Galle district", type: "disaster" },
      { year: 2017, event: "Severe flooding damages historic buildings", type: "disaster" },
      { year: 2022, event: "Galle Literary Festival resumes post-pandemic", type: "cultural" },
    ],
    riskHistory: [
      { year: 2024, month: "May", type: "Flood", severity: "moderate", description: "Southwest monsoon caused waterlogging in low-lying areas" },
      { year: 2023, month: "Jun", type: "Heavy Rain", severity: "high", description: "Coastal erosion concerns along southern beach areas" },
      { year: 2023, month: "Nov", type: "Heavy Rain", severity: "moderate", description: "Strong waves and rough seas during northeast monsoon" },
      { year: 2022, month: "May", type: "Flood", severity: "moderate", description: "Gin River flooding affected surrounding villages" },
    ],
    safetyNotes: [
      "The fort area is well-elevated and generally safe from flooding",
      "Coastal areas south of Galle face tsunami risk - know evacuation routes",
      "Strong ocean currents during monsoon make swimming dangerous",
      "The fort walls have no railings in some areas - supervise children",
    ],
  },
  mirissa: {
    culturalHistory: "Mirissa has evolved from a small fishing village into one of Sri Lanka's premier beach destinations over the past two decades. The name comes from the Sinhalese word 'Meerissa' meaning 'crescent'. Mirissa Bay became internationally known in the 2000s as one of the best blue whale watching spots in the world, with the continental shelf dropping off just a few kilometers from shore, creating ideal conditions for spotting blue whales, sperm whales, and dolphins from November to April.",
    historicalEvents: [
      { year: 2004, event: "Tsunami devastates Mirissa fishing community", type: "disaster" },
      { year: 2008, event: "Whale watching tourism begins commercially", type: "development" },
      { year: 2015, event: "Mirissa becomes top-rated beach destination in Asia", type: "milestone" },
      { year: 2020, event: "Coconut Tree Hill goes viral on social media", type: "cultural" },
    ],
    riskHistory: [
      { year: 2024, month: "Jun", type: "Heavy Rain", severity: "moderate", description: "Rough seas during monsoon, whale watching suspended" },
      { year: 2023, month: "May", type: "Heavy Rain", severity: "high", description: "Strong coastal storms with high waves" },
      { year: 2022, month: "Jun", type: "Heavy Rain", severity: "moderate", description: "Beach erosion reported during peak monsoon" },
    ],
    safetyNotes: [
      "Strong rip currents present year-round - swim only in designated areas",
      "Whale watching season is November to April - rough seas other months",
      "Beach nightlife area can be isolated late at night - travel in groups",
      "Sunburn risk is very high - use SPF 50+ sunscreen",
    ],
  },
  "nuwara-eliya": {
    culturalHistory: "Known as 'Little England', Nuwara Eliya was developed as a health resort by British colonizers in the 19th century. Sir Samuel Baker, the famous explorer, discovered the area in 1847 and established it as a retreat from the tropical heat of the lowlands. The town retains much of its colonial character with Tudor-style bungalows, a golf course (one of Asia's oldest), and the famous Hill Club. The surrounding tea plantations produce some of the world's finest Ceylon tea.",
    historicalEvents: [
      { year: 1847, event: "Sir Samuel Baker discovers and develops Nuwara Eliya", type: "milestone" },
      { year: 1867, event: "James Taylor plants first tea bushes nearby", type: "milestone" },
      { year: 2003, event: "Severe frost damages tea crops - rare cold event", type: "disaster" },
      { year: 2016, event: "Landslides in surrounding tea estates kill 100+", type: "disaster" },
      { year: 2024, event: "Record low temperatures recorded at 2°C", type: "milestone" },
    ],
    riskHistory: [
      { year: 2024, month: "May", type: "Landslide", severity: "high", description: "Multiple landslides in tea estate areas during heavy rain" },
      { year: 2023, month: "Jun", type: "Landslide", severity: "critical", description: "Major landslide near Walapane area" },
      { year: 2023, month: "Oct", type: "Heavy Rain", severity: "moderate", description: "Waterfall areas flooded, trails closed" },
      { year: 2022, month: "May", type: "Landslide", severity: "high", description: "Erosion-prone hillsides collapsed after heavy rains" },
    ],
    safetyNotes: [
      "Landslide risk is very high in surrounding hill areas during monsoon",
      "Temperatures can drop to near-freezing at night - pack warm clothing",
      "Mountain roads are winding and often foggy - drive slowly",
      "Horton Plains can be extremely cold and windy - prepare accordingly",
    ],
  },
  yala: {
    culturalHistory: "Yala National Park was designated as a wildlife sanctuary in 1900 and became a national park in 1938. The park covers 979 square kilometers and has the highest leopard density in the world - approximately one leopard per square kilometer. The park also contains the ancient Buddhist monastery of Sithulpawwa, dating back to the 2nd century BC, which once housed 12,000 monks. During the 2004 tsunami, Yala suffered devastating losses as coastal areas of the park were inundated.",
    historicalEvents: [
      { year: 1900, event: "Yala designated as wildlife sanctuary", type: "milestone" },
      { year: 1938, event: "Upgraded to National Park status", type: "milestone" },
      { year: 2004, event: "Tsunami kills 250+ visitors and staff at Yala", type: "disaster" },
      { year: 2014, event: "Elephant gathering of 300+ recorded - largest in decades", type: "milestone" },
      { year: 2024, event: "New leopard tracking program launched with GPS collars", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "Feb", type: "Other", severity: "low", description: "Park briefly closed due to elephant aggression on safari vehicles" },
      { year: 2023, month: "Sep", type: "Flood", severity: "moderate", description: "Seasonal waterholes overflowed blocking safari routes" },
      { year: 2022, month: "Nov", type: "Heavy Rain", severity: "low", description: "Park reopened after seasonal closure with minor flooding" },
    ],
    safetyNotes: [
      "Park closes September-October annually for wildlife breeding season",
      "Never leave the safari jeep - wild elephants and leopards are dangerous",
      "Coastal areas of Yala face tsunami risk - follow park ranger instructions",
      "Carry plenty of water - temperatures can exceed 35°C in dry season",
    ],
  },
  trincomalee: {
    culturalHistory: "Trincomalee possesses one of the finest natural harbors in the world, attracting traders and conquerors for millennia. The ancient Koneswaram Temple sits atop Swami Rock, originally built in the 3rd century BC. The harbor has been fought over by Portuguese, Dutch, French, and British colonial powers. During World War II, the Japanese bombed Trincomalee harbor in 1942, sinking the HMS Hermes - the world's first purpose-built aircraft carrier.",
    historicalEvents: [
      { year: -300, event: "Koneswaram Temple constructed on Swami Rock", type: "milestone" },
      { year: 1624, event: "Portuguese destroy the original Koneswaram Temple", type: "disaster" },
      { year: 1942, event: "Japanese bombing raid on Trincomalee harbor", type: "disaster" },
      { year: 2004, event: "Tsunami causes severe damage to Trincomalee coast", type: "disaster" },
      { year: 2023, event: "Pigeon Island coral restoration project launched", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "Nov", type: "Heavy Rain", severity: "high", description: "Northeast monsoon brought heavy rainfall and rough seas" },
      { year: 2023, month: "Dec", type: "Flood", severity: "moderate", description: "Flooding in low-lying areas during northeast monsoon" },
      { year: 2022, month: "Nov", type: "Heavy Rain", severity: "high", description: "Cyclone remnants brought heavy rainfall" },
    ],
    safetyNotes: [
      "East coast has opposite monsoon season - best May to September",
      "Strong currents at Nilaveli Beach - always swim with lifeguards present",
      "Pigeon Island snorkeling has sharp coral - wear reef-safe water shoes",
      "Tsunami evacuation routes are posted along the coast",
    ],
  },
  anuradhapura: {
    culturalHistory: "Anuradhapura was the first established capital of ancient Sri Lanka, founded in 377 BC by King Pandukabhaya. For over 1,400 years, it served as the center of Theravada Buddhism. The Sri Maha Bodhi tree, planted in 288 BC from a branch of the original Bodhi tree in India, is the oldest documented tree in the world. The city's massive stupas, including the Jetavanaramaya (originally 122 meters tall), were among the largest structures in the ancient world.",
    historicalEvents: [
      { year: -377, event: "King Pandukabhaya establishes Anuradhapura as capital", type: "milestone" },
      { year: -288, event: "Sri Maha Bodhi tree planted - world's oldest documented tree", type: "milestone" },
      { year: -250, event: "Buddhism introduced to Sri Lanka from India", type: "milestone" },
      { year: 1982, event: "UNESCO World Heritage Site designation", type: "milestone" },
      { year: 2022, event: "Archaeological discovery of new ancient monastery complex", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "Nov", type: "Heavy Rain", severity: "moderate", description: "Ancient reservoirs overflowed during heavy rains" },
      { year: 2023, month: "Dec", type: "Flood", severity: "low", description: "Minor flooding near Nuwara Wewa tank" },
      { year: 2022, month: "Oct", type: "Heavy Rain", severity: "low", description: "Seasonal rainfall within normal parameters" },
    ],
    safetyNotes: [
      "Hot and dry climate - carry water and sun protection at all times",
      "Archaeological sites have uneven terrain - wear sturdy footwear",
      "Dress modestly when visiting sacred Buddhist sites (cover shoulders and knees)",
      "Macaque monkeys can be aggressive - secure belongings",
    ],
  },
  polonnaruwa: {
    culturalHistory: "Polonnaruwa became the second capital of Sri Lanka after the destruction of Anuradhapura in 993 AD by the Chola invasion from India. King Vijayabahu I recaptured the city in 1070 and began extensive development. King Parakramabahu I (1153-1186 AD) transformed Polonnaruwa into a magnificent city with the Gal Vihara rock sculptures - considered the finest examples of ancient Sri Lankan sculpture. The massive Parakrama Samudra reservoir, still functioning today, is a testament to ancient hydraulic engineering.",
    historicalEvents: [
      { year: 1070, event: "King Vijayabahu I establishes Polonnaruwa as capital", type: "milestone" },
      { year: 1153, event: "King Parakramabahu I builds the golden age city", type: "milestone" },
      { year: 1293, event: "Polonnaruwa abandoned as capital - moved south", type: "milestone" },
      { year: 1982, event: "UNESCO World Heritage Site designation", type: "milestone" },
      { year: 2024, event: "New visitor center and digital museum opened", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "Nov", type: "Flood", severity: "moderate", description: "Parakrama Samudra sluice gates opened, minor flooding downstream" },
      { year: 2023, month: "Dec", type: "Heavy Rain", severity: "low", description: "Seasonal rains with no major incidents" },
    ],
    safetyNotes: [
      "Cycling is the best way to explore - but roads can be sandy and uneven",
      "Very hot in the dry zone - avoid midday exploration (11am-2pm)",
      "Wild elephants occasionally enter the archaeological zone from nearby forests",
      "Carry insect repellent - mosquitoes are active near the ancient tanks",
    ],
  },
  dambulla: {
    culturalHistory: "The Dambulla Cave Temple complex dates back to the 1st century BC when King Valagamba took refuge in these caves during a South Indian invasion. After reclaiming his throne, he converted the caves into a magnificent temple complex. The five caves contain over 150 Buddha statues and 2,100 square meters of painted murals - the largest and best-preserved collection of cave paintings in Sri Lanka. The temple has been in continuous use for over 2,000 years.",
    historicalEvents: [
      { year: -100, event: "King Valagamba creates the cave temple complex", type: "milestone" },
      { year: 1991, event: "UNESCO World Heritage Site designation", type: "milestone" },
      { year: 2013, event: "Controversial golden Buddha museum built at base", type: "development" },
    ],
    riskHistory: [
      { year: 2024, month: "May", type: "Heavy Rain", severity: "low", description: "Brief thunderstorms, temple access unaffected" },
      { year: 2023, month: "Apr", type: "Heavy Rain", severity: "low", description: "Seasonal transition rains, normal conditions" },
    ],
    safetyNotes: [
      "The climb to the caves involves steep steps - wear comfortable shoes",
      "Monkeys near the entrance can be aggressive - don't carry visible food",
      "Remove shoes and hats before entering the cave temples",
      "Nearby Sigiriya and Dambulla can be combined in one day trip",
    ],
  },
  bentota: {
    culturalHistory: "Bentota takes its name from a mythical demon called 'Bem' who is said to have ruled the area in ancient times. The region gained prominence during the colonial era as a rest stop between Colombo and Galle. In the 20th century, renowned Sri Lankan architect Geoffrey Bawa chose Bentota to build his iconic Lunuganga estate and Brief Garden. The Bentota River estuary creates a unique ecosystem where freshwater meets the Indian Ocean, supporting rich biodiversity.",
    historicalEvents: [
      { year: 1929, event: "Geoffrey Bawa begins developing Lunuganga estate", type: "development" },
      { year: 2004, event: "Tsunami causes moderate damage to beach resorts", type: "disaster" },
      { year: 2015, event: "Bentota becomes Sri Lanka's water sports capital", type: "milestone" },
    ],
    riskHistory: [
      { year: 2024, month: "May", type: "Heavy Rain", severity: "moderate", description: "Beach erosion during southwest monsoon" },
      { year: 2023, month: "Jun", type: "Heavy Rain", severity: "moderate", description: "Rough seas, water sports temporarily suspended" },
    ],
    safetyNotes: [
      "Strong rip currents during monsoon (May-October) - swim with caution",
      "Bentota River crocodile sightings reported - follow guide instructions on boat safaris",
      "Best beach conditions December to April",
      "Water sports operators should have valid safety certifications",
    ],
  },
  "arugam-bay": {
    culturalHistory: "Arugam Bay has been a fishing village for centuries, inhabited by Tamil and Muslim communities. Its world-class surf break was 'discovered' by international surfers in the 1970s, and it has since become one of Asia's top surf destinations. The nearby Kumana National Park (formerly Yala East) is a crucial bird sanctuary. The area was heavily affected by the 2004 tsunami and the civil war, but has rebuilt itself into a thriving surf and eco-tourism hub.",
    historicalEvents: [
      { year: 1978, event: "International surfers discover Arugam Bay's point break", type: "milestone" },
      { year: 2004, event: "Tsunami devastates Arugam Bay - village almost completely destroyed", type: "disaster" },
      { year: 2009, event: "End of civil war reopens east coast tourism", type: "milestone" },
      { year: 2019, event: "Ranked in world's top 10 surf destinations", type: "milestone" },
    ],
    riskHistory: [
      { year: 2024, month: "Nov", type: "Heavy Rain", severity: "high", description: "Northeast monsoon brought flooding to surrounding areas" },
      { year: 2023, month: "Dec", type: "Flood", severity: "moderate", description: "Lagoon flooding affected access roads" },
      { year: 2022, month: "Nov", type: "Heavy Rain", severity: "high", description: "Cyclone remnants brought strong winds and heavy rain" },
    ],
    safetyNotes: [
      "Surf season is April to October - dangerous currents other months",
      "East coast faces different monsoon than west coast",
      "Tsunami evacuation routes are posted - learn them on arrival",
      "Remote location - nearest major hospital is in Ampara (2 hours)",
    ],
  },
  "adams-peak": {
    culturalHistory: "Adam's Peak (Sri Pada) is a 2,243m mountain sacred to four religions. Buddhists believe the footprint at the summit belongs to Lord Buddha, Hindus attribute it to Shiva, Muslims to Adam (making it the place where Adam first set foot on Earth after expulsion from Eden), and Christians associate it with St. Thomas. The pilgrimage tradition dates back over 1,000 years, and the ascent of 5,500 steps has been made by millions of devotees and travelers.",
    historicalEvents: [
      { year: 1000, event: "Recorded pilgrimages to Sri Pada begin", type: "cultural" },
      { year: 1505, event: "Portuguese record the mountain in European chronicles", type: "milestone" },
      { year: 2010, event: "Solar-powered lighting installed along pilgrimage path", type: "development" },
      { year: 2016, event: "Landslides damage access roads during heavy monsoon", type: "disaster" },
    ],
    riskHistory: [
      { year: 2024, month: "May", type: "Landslide", severity: "high", description: "Trail closures due to landslide risk during off-season" },
      { year: 2023, month: "Jun", type: "Heavy Rain", severity: "critical", description: "Pilgrimage path flooded, access completely restricted" },
      { year: 2022, month: "Jul", type: "Landslide", severity: "moderate", description: "Minor slides near Hatton approach road" },
    ],
    safetyNotes: [
      "Pilgrimage season is December to May only - trail is dangerous off-season",
      "Start the climb at 2 AM to reach summit for sunrise",
      "Temperatures near summit can drop to 5°C - bring warm layers",
      "The descent is harder on knees than the ascent - bring trekking poles",
      "Leeches are common on the trail during wet months",
    ],
  },
};
