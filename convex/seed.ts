import { mutation } from "./_generated/server";

// Seed the database with initial deck and card data
// Run this once via the Convex dashboard or a button in dev mode
export const seedData = mutation({
  handler: async (ctx) => {
    // Check if data already exists
    const existingDecks = await ctx.db.query("decks").first();
    if (existingDecks) {
      return { message: "Data already seeded" };
    }

    // --- DECK 1: Mindful Animals ---
    const animalsDeckId = await ctx.db.insert("decks", {
      title: "Mindful Animals",
      description:
        "Discover wisdom from the animal kingdom. Each card reveals the patience, strength, and instinct that nature teaches us.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&h=400&fit=crop",
      category: "animals",
      totalCards: 30,
      isActive: true,
      colorTheme: "emerald",
    });

    const animalCards = [
      { quote: "The early bird catches the worm, but the wise owl hunts at night.", author: "Proverb", description: "Timing matters more than speed. Find the rhythm that works for you, not the one the world expects.", imageUrl: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=600&h=400&fit=crop" },
      { quote: "In the eyes of a wolf, you see both the hunter and the hunted.", author: "Unknown", description: "Strength and vulnerability coexist. Embrace both sides of yourself.", imageUrl: "https://images.unsplash.com/photo-1516642499542-4834292d0007?w=600&h=400&fit=crop" },
      { quote: "The butterfly counts not months but moments, and has time enough.", author: "Rabindranath Tagore", description: "A short life lived fully is richer than a long life lived passively.", imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop" },
      { quote: "Be like the elephant: patient, wise, and unstoppable when the path is clear.", author: "Unknown", description: "Patience is not passive. It is concentrated strength waiting for the right moment.", imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&h=400&fit=crop" },
      { quote: "The lion does not turn around when a small dog barks.", author: "African Proverb", description: "Stay focused on your purpose. Not every challenge deserves your energy.", imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&h=400&fit=crop" },
      { quote: "A fish cannot drown in water. A bird does not fall in air.", author: "Meister Eckhart", description: "You are made for your environment. Trust your nature and thrive where you belong.", imageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&h=400&fit=crop" },
      { quote: "The snake which cannot cast its skin has to die.", author: "Friedrich Nietzsche", description: "Growth requires shedding the old. Release what no longer serves you.", imageUrl: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=600&h=400&fit=crop" },
      { quote: "The hummingbird teaches us that joy is found in the smallest moments.", author: "Unknown", description: "Do not wait for grand events. The sweetness of life hides in the everyday.", imageUrl: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=600&h=400&fit=crop" },
      { quote: "Even the smallest cat is a masterpiece.", author: "Leonardo da Vinci", description: "Never underestimate what seems small. Perfection has no size requirement.", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop" },
      { quote: "The horse is prepared for the day of battle, but victory belongs to the Lord.", author: "Proverbs 21:31", description: "Do your part in preparation, then trust the outcome to forces greater than yourself.", imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=400&fit=crop" },
      { quote: "An ant on the move does more than a dozing ox.", author: "Lao Tzu", description: "Small consistent effort beats big unfocused power every time.", imageUrl: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&h=400&fit=crop" },
      { quote: "The turtle lays thousands of eggs without anyone knowing, but when the chicken lays an egg, the whole country is informed.", author: "Malaysian Proverb", description: "True work is often invisible. Do not measure your worth by others' applause.", imageUrl: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=600&h=400&fit=crop" },
      { quote: "A dog teaches a boy fidelity, perseverance, and to turn around three times before lying down.", author: "Robert Benchley", description: "Loyalty and routine create the foundation for a meaningful life.", imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop" },
      { quote: "The eagle does not fight the snake on the ground. It picks it up and changes the battlefield.", author: "Unknown", description: "Choose your battles wisely. Sometimes winning means changing the rules.", imageUrl: "https://images.unsplash.com/photo-1611689342806-0863700ce8e4?w=600&h=400&fit=crop" },
      { quote: "When spiders unite, they can tie down a lion.", author: "Ethiopian Proverb", description: "Individual weakness becomes collective strength. Never underestimate the power of unity.", imageUrl: "https://images.unsplash.com/photo-1593590008439-8a82e0d79e89?w=600&h=400&fit=crop" },
      { quote: "The dolphin swims through storms and calm waters alike with the same grace.", author: "Unknown", description: "Let your character remain constant regardless of circumstances.", imageUrl: "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=600&h=400&fit=crop" },
      { quote: "A bird sitting on a tree is never afraid of the branch breaking, because its trust is not on the branch but on its own wings.", author: "Charlie Wardle", description: "Trust your own abilities. External support is temporary; internal strength is forever.", imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop" },
      { quote: "The bear hibernates not out of laziness, but out of wisdom.", author: "Unknown", description: "Rest is not retreat. Sometimes stepping back is the most strategic move.", imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&h=400&fit=crop" },
      { quote: "A fox smells its own lair first.", author: "French Proverb", description: "Know yourself before you seek to know the world.", imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&h=400&fit=crop" },
      { quote: "The octopus has three hearts and blue blood. Being different is not a flaw; it is an adaptation.", author: "Unknown", description: "What makes you unusual is what makes you extraordinary.", imageUrl: "https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=600&h=400&fit=crop" },
      { quote: "When the bee collects nectar, it also pollinates the flower. True work benefits everyone.", author: "Unknown", description: "Pursue your goals with the awareness that your effort can lift others too.", imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop" },
      { quote: "A cheetah cannot change its spots, but it can choose which direction to run.", author: "Unknown", description: "You cannot change your nature, but you can always choose your direction.", imageUrl: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&h=400&fit=crop" },
      { quote: "The salmon swims upstream not because it is easy, but because that is where life begins.", author: "Unknown", description: "The hardest path often leads to the most meaningful destination.", imageUrl: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&h=400&fit=crop" },
      { quote: "Like the chameleon, the wise person adapts without losing their true colors.", author: "Unknown", description: "Flexibility is strength, but never lose sight of who you truly are.", imageUrl: "https://images.unsplash.com/photo-1504450874802-0ba2bcd659e0?w=600&h=400&fit=crop" },
      { quote: "The owl sees in darkness what others miss in the light.", author: "Unknown", description: "Perspective is everything. What others fear, you can learn to navigate.", imageUrl: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=600&h=400&fit=crop" },
      { quote: "A whale sings across entire oceans. Your voice carries further than you think.", author: "Unknown", description: "Never underestimate the impact of your words and actions.", imageUrl: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600&h=400&fit=crop" },
      { quote: "The penguin thrives in conditions that would defeat most creatures.", author: "Unknown", description: "Adversity is not your enemy; it is the sculptor of your resilience.", imageUrl: "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=600&h=400&fit=crop" },
      { quote: "Geese fly in formation because each one lifts the others.", author: "Unknown", description: "Leadership is not about being in front. It is about making the journey easier for everyone.", imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop" },
      { quote: "The starfish regenerates what it loses. Your setbacks are not permanent.", author: "Unknown", description: "You have the power to rebuild. Every ending contains the seed of a new beginning.", imageUrl: "https://images.unsplash.com/photo-1530053969600-caed2596d242?w=600&h=400&fit=crop" },
      { quote: "A firefly does not compete with the sun. It shines when it is its time.", author: "Unknown", description: "Do not compare your light to others. Your moment will come.", imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=400&fit=crop" },
    ];

    for (let i = 0; i < animalCards.length; i++) {
      await ctx.db.insert("cards", {
        deckId: animalsDeckId,
        ...animalCards[i],
        cardNumber: i + 1,
      });
    }

    // --- DECK 2: Wisdom of Trees ---
    const treesDeckId = await ctx.db.insert("decks", {
      title: "Wisdom of Trees",
      description:
        "Root yourself in ancient wisdom. Trees teach us about growth, patience, and the strength found in stillness.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
      category: "trees",
      totalCards: 30,
      isActive: true,
      colorTheme: "amber",
    });

    const treeCards = [
      { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", description: "It is never too late to begin. Start where you are with what you have.", imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=400&fit=crop" },
      { quote: "A tree with strong roots laughs at storms.", author: "Malay Proverb", description: "Build your foundation deep. When you are grounded, nothing can shake you.", imageUrl: "https://images.unsplash.com/photo-1518173946687-a30fa6aab1f0?w=600&h=400&fit=crop" },
      { quote: "The creation of a thousand forests is in one acorn.", author: "Ralph Waldo Emerson", description: "Every great achievement begins as a single small seed of intention.", imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop" },
      { quote: "Trees that are slow to grow bear the best fruit.", author: "Moliere", description: "Do not rush your development. The most enduring results take time.", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop" },
      { quote: "In a forest of a hundred thousand trees, no two leaves are alike. And no two journeys along the same path are alike.", author: "Paulo Coelho", description: "Your path is uniquely yours. Comparison is the thief of wonder.", imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop" },
      { quote: "The oak fought the wind and was broken, the willow bent and survived.", author: "Robert Jordan", description: "Flexibility is not weakness. The ability to bend without breaking is true power.", imageUrl: "https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=600&h=400&fit=crop" },
      { quote: "A society grows great when old men plant trees in whose shade they shall never sit.", author: "Greek Proverb", description: "True greatness is building something that outlasts you.", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop" },
      { quote: "Between every two pines there is a doorway to a new world.", author: "John Muir", description: "Opportunity exists in every gap. Look for the openings between obstacles.", imageUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=600&h=400&fit=crop" },
      { quote: "He who plants a tree, plants a hope.", author: "Lucy Larcom", description: "Every act of creation is an act of optimism about the future.", imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=400&fit=crop" },
      { quote: "The tree does not withdraw its shade from the woodcutter.", author: "Indian Proverb", description: "Generosity does not keep score. Give freely, regardless of how others treat you.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" },
      { quote: "Even if I knew that tomorrow the world would go to pieces, I would still plant my apple tree.", author: "Martin Luther", description: "Hope is an action, not a feeling. Keep building regardless of uncertainty.", imageUrl: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&h=400&fit=crop" },
      { quote: "The pine stays green in winter. Wisdom in hardship.", author: "Chinese Proverb", description: "Your character is revealed not in comfort but in adversity.", imageUrl: "https://images.unsplash.com/photo-1477511801984-4ad318ed9846?w=600&h=400&fit=crop" },
      { quote: "Look deep into nature, and then you will understand everything better.", author: "Albert Einstein", description: "When confused, simplify. Nature holds answers that complexity hides.", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop" },
      { quote: "A tree is known by its fruit; a man by his deeds.", author: "Saint Basil", description: "Words are wind. Let your actions speak for who you are.", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop" },
      { quote: "The clearest way into the Universe is through a forest wilderness.", author: "John Muir", description: "Clarity comes when you remove distractions and immerse yourself in what is real.", imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop" },
      { quote: "Trees are poems that the earth writes upon the sky.", author: "Kahlil Gibran", description: "You are an expression of something greater. Let yourself grow toward the light.", imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=400&fit=crop" },
      { quote: "The tree which moves some to tears of joy is in the eyes of others only a green thing that stands in the way.", author: "William Blake", description: "Not everyone will see your beauty. Those who do are your people.", imageUrl: "https://images.unsplash.com/photo-1518173946687-a30fa6aab1f0?w=600&h=400&fit=crop" },
      { quote: "To be without trees would, in the most literal way, to be without our roots.", author: "Richard Mabey", description: "Stay connected to what grounds you. Without roots, there can be no growth.", imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop" },
      { quote: "The tallest oak in the forest was once just a little nut that held its ground.", author: "Unknown", description: "Persistence is the difference between a seed and a tree.", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop" },
      { quote: "Someone is sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett", description: "Your investments of time and effort today will shelter someone tomorrow.", imageUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=600&h=400&fit=crop" },
      { quote: "A single tree can start a forest, a single smile can start a friendship.", author: "Unknown", description: "Do not underestimate small beginnings. Every great thing started with one step.", imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=400&fit=crop" },
      { quote: "When you go to a garden, do you look at thorns or flowers? Spend more time with roses and jasmine.", author: "Rumi", description: "Where you focus your attention shapes your experience. Choose beauty.", imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=400&fit=crop" },
      { quote: "The forest was shrinking, but the trees kept voting for the axe, for the axe was clever and convinced the trees that because his handle was made of wood he was one of them.", author: "Turkish Proverb", description: "Be discerning about who you trust. Not everyone who looks like you has your interests at heart.", imageUrl: "https://images.unsplash.com/photo-1477511801984-4ad318ed9846?w=600&h=400&fit=crop" },
      { quote: "In every walk with nature, one receives far more than one seeks.", author: "John Muir", description: "Be open to unexpected gifts. Sometimes the answers come before the questions.", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop" },
      { quote: "A single leaf working alone provides no shade.", author: "Chuck Page", description: "Individual effort matters, but community multiplies impact.", imageUrl: "https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=600&h=400&fit=crop" },
      { quote: "The tree remembers what the axe forgets.", author: "African Proverb", description: "Be mindful of the impact you have on others. They will remember long after you have moved on.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" },
      { quote: "Bamboo that bends is stronger than the oak that resists.", author: "Japanese Proverb", description: "Adaptability is the ultimate survival skill. Rigid structures crack under pressure.", imageUrl: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&h=400&fit=crop" },
      { quote: "The fruit of silence is prayer. The fruit of prayer is faith. The fruit of faith is love. The fruit of love is service. The fruit of service is peace.", author: "Mother Teresa", description: "Growth is sequential. Each stage builds naturally upon the last.", imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=400&fit=crop" },
      { quote: "If you want to see the sunshine, you have to weather the storm.", author: "Frank Lane", description: "Good times follow hard times. Endurance is the bridge between the two.", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop" },
      { quote: "Every flower blooms in its own time.", author: "Ken Petti", description: "Do not rush your season. Your time to bloom will come.", imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=400&fit=crop" },
    ];

    for (let i = 0; i < treeCards.length; i++) {
      await ctx.db.insert("cards", {
        deckId: treesDeckId,
        ...treeCards[i],
        cardNumber: i + 1,
      });
    }

    // --- DECK 3: Motivation & Success ---
    const motivationDeckId = await ctx.db.insert("decks", {
      title: "Motivation & Success",
      description:
        "Ignite your drive. Daily fuel for ambition, resilience, and the relentless pursuit of your best self.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop",
      category: "motivation",
      totalCards: 30,
      isActive: true,
      colorTheme: "violet",
    });

    const motivationCards = [
      { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", description: "Passion is not a luxury; it is the fuel for excellence. Find what sets your soul on fire.", imageUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop" },
      { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", description: "Neither victory nor defeat is permanent. What matters is that you keep going.", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop" },
      { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", description: "Your vision of what is possible is the first step toward making it real.", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" },
      { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", description: "Progress is progress, no matter the pace. Consistency beats speed.", imageUrl: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&h=400&fit=crop" },
      { quote: "Believe you can and you are halfway there.", author: "Theodore Roosevelt", description: "Self-belief is not arrogance. It is the foundation upon which action is built.", imageUrl: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=600&h=400&fit=crop" },
      { quote: "Your time is limited. Do not waste it living someone else's life.", author: "Steve Jobs", description: "Authenticity is the ultimate act of courage. Live by your own design.", imageUrl: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=600&h=400&fit=crop" },
      { quote: "The secret of getting ahead is getting started.", author: "Mark Twain", description: "Overthinking is the enemy of progress. Take the first step, then the next.", imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop" },
      { quote: "I have not failed. I have just found 10,000 ways that will not work.", author: "Thomas Edison", description: "Failure is feedback. Each attempt brings you closer to the solution.", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop" },
      { quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar", description: "The journey shapes you more than the destination. Growth is the real reward.", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop" },
      { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins", description: "Possibility starts the moment you decide to move. Hesitation is the only real barrier.", imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop" },
      { quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", description: "Focus on the work, not the outcome. Results follow relentless effort.", imageUrl: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&h=400&fit=crop" },
      { quote: "Do not watch the clock; do what it does. Keep going.", author: "Sam Levenson", description: "Time does not wait, and neither should you. Move forward, always.", imageUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop" },
      { quote: "Hard work beats talent when talent does not work hard.", author: "Tim Notke", description: "Natural gifts mean nothing without discipline. Effort is the great equalizer.", imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop" },
      { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", description: "Destiny is not handed to you. It is crafted, one decision at a time.", imageUrl: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=600&h=400&fit=crop" },
      { quote: "You miss 100% of the shots you do not take.", author: "Wayne Gretzky", description: "Risk is the price of opportunity. The biggest failure is never trying.", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop" },
      { quote: "If you are going through hell, keep going.", author: "Winston Churchill", description: "The worst thing you can do in a difficult season is stop moving.", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop" },
      { quote: "The mind is everything. What you think, you become.", author: "Buddha", description: "Guard your thoughts like a fortress. They are the architects of your reality.", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" },
      { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", description: "When you focus on adding value to others, success follows as a byproduct.", imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop" },
      { quote: "The best revenge is massive success.", author: "Frank Sinatra", description: "Channel frustration into fuel. Let your results speak louder than any words.", imageUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop" },
      { quote: "Everything you have ever wanted is on the other side of fear.", author: "George Addair", description: "Fear is a doorway, not a wall. Step through it.", imageUrl: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&h=400&fit=crop" },
      { quote: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey", description: "You cannot control what happens to you, but you can always control how you respond.", imageUrl: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&h=400&fit=crop" },
      { quote: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg", description: "In a world that changes fast, the only strategy that is guaranteed to fail is not taking risks.", imageUrl: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=600&h=400&fit=crop" },
      { quote: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", description: "Perfection is not required. Start with what is available and build from there.", imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop" },
      { quote: "Action is the foundational key to all success.", author: "Pablo Picasso", description: "Ideas without action are daydreams. Execution is everything.", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop" },
      { quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", description: "Your inner resources are far greater than any external challenge.", imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop" },
      { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", description: "Darkness is not the absence of hope; it is the invitation to find it.", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop" },
      { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", description: "Words create plans. Actions create results. Stop planning and start building.", imageUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=400&fit=crop" },
      { quote: "Whether you think you can or you think you cannot, you are right.", author: "Henry Ford", description: "Your beliefs set the ceiling for your achievements. Choose empowering beliefs.", imageUrl: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=600&h=400&fit=crop" },
      { quote: "Twenty years from now you will be more disappointed by the things you did not do than by the ones you did.", author: "Mark Twain", description: "Regret comes from inaction, not from trying and failing. Be bold.", imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop" },
      { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", description: "Doubt is the anchor that keeps you from sailing. Cut it loose and set course.", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" },
    ];

    for (let i = 0; i < motivationCards.length; i++) {
      await ctx.db.insert("cards", {
        deckId: motivationDeckId,
        ...motivationCards[i],
        cardNumber: i + 1,
      });
    }

    return {
      message: "Seeded 3 decks with 30 cards each (90 cards total)",
      deckIds: {
        animals: animalsDeckId,
        trees: treesDeckId,
        motivation: motivationDeckId,
      },
    };
  },
});
