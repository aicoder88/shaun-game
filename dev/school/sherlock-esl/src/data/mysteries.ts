import type { Mystery } from '../types/game';

export const mysteriesDatabase: Mystery[] = [
  // Carriage 1: The Diamond Theft (Steampunk Era)
  {
    id: 'diamond_theft',
    title: 'The Diamond Theft',
    description: 'Lady Pemberton\'s precious "Star of Bengal" diamond has vanished from her jewelry box during the night. The thief must be among the first-class passengers, but who would dare rob a lady of such high standing? The game begins with examining the crime scene and questioning three prime suspects.',
    carriageNumber: 1,
    suspects: [
      { 
        id: 'lady_pemberton', 
        name: 'Lady Pemberton', 
        description: 'A wealthy widow traveling to London. She discovered the theft this morning and seems genuinely distraught. However, seasoned detectives know that sometimes the victim isn\'t always innocent.', 
        alibi: 'Claims she was in the dining car having tea with other passengers until midnight', 
        suspicious: false 
      },
      { 
        id: 'mr_blackwood', 
        name: 'Mr. Blackwood', 
        description: 'A mysterious gentleman with calloused hands and nervous mannerisms. He carries himself like nobility but his accent slips occasionally, revealing humble origins. His cabin is directly adjacent to Lady Pemberton\'s.', 
        alibi: 'Claims to have been reading detective novels in his compartment all evening', 
        suspicious: true 
      },
      { 
        id: 'conductor_williams', 
        name: 'Conductor Williams', 
        description: 'A veteran railway employee who has worked this route for 15 years. He has master keys to all compartments and extensive knowledge of passenger habits. Recently his wife fell ill and medical bills have been mounting.', 
        alibi: 'Was checking tickets and maintaining schedules until 2 AM', 
        suspicious: false 
      }
    ],
    evidence: [
      { 
        id: 'golden_button', 
        name: 'Golden Button', 
        description: 'An ornate button made of real gold, found near the jewelry box. It appears to have been torn from an expensive waistcoat in a struggle.', 
        location: 'First Class Compartment', 
        found: false 
      },
      { 
        id: 'torn_fabric', 
        name: 'Torn Silk Fabric', 
        description: 'A piece of expensive purple silk caught on the jewelry box\'s sharp corner. The fabric is of the finest quality, suggesting it came from formal evening wear.', 
        location: 'First Class Compartment', 
        found: false 
      },
      { 
        id: 'secret_note', 
        name: 'Coded Message', 
        description: 'A cryptic note found under the door: "The star shines brightest before dawn. Meet me where steam rises at the witching hour." What could this mysterious message mean?', 
        location: 'First Class Compartment', 
        found: false,
        piecesTogether: false
      },
      { 
        id: 'brass_key', 
        name: 'Unusual Brass Key', 
        description: 'A specially crafted key that doesn\'t match any standard train compartment lock. Its unique design suggests it was made for a specific, important purpose.', 
        location: 'First Class Compartment', 
        found: false 
      }
    ],
    solution: 'mr_blackwood',
    completed: false
  },

  // Carriage 2: Poison at Dinner (Steampunk Era)
  {
    id: 'poison_dinner',
    title: 'Poison at Dinner',
    description: 'Chef Auguste Moreau, renowned for his culinary masterpieces, has collapsed after tasting the evening\'s special soup. His condition is grave, and Dr. Hartwell suspects poison. Was this an accident, or did someone deliberately target the celebrated chef? The dining car holds many secrets.',
    carriageNumber: 2,
    suspects: [
      { 
        id: 'sous_chef', 
        name: 'Henri Dubois', 
        description: 'The ambitious sous chef who has lived in Chef Moreau\'s shadow for years. He recently applied for head chef positions at prestigious London hotels. His knife skills are exceptional, but is he capable of more sinister acts?', 
        alibi: 'Was preparing the dessert course in the pantry when the incident occurred', 
        suspicious: true 
      },
      { 
        id: 'waitress', 
        name: 'Marie Rousseau', 
        description: 'A dedicated waitress who takes pride in her service. Last week, Chef Moreau publicly criticized her for a minor serving error, embarrassing her in front of wealthy passengers. She has knowledge of which dishes go to which tables.', 
        alibi: 'Was serving the main course to passengers in the dining hall', 
        suspicious: false 
      },
      { 
        id: 'passenger_doctor', 
        name: 'Dr. Edmund Hartwell', 
        description: 'A distinguished physician traveling to London for a medical conference. He was the first to diagnose the poisoning and has extensive knowledge of toxic substances. Ironically, his medical expertise makes him both the most likely to help and to harm.', 
        alibi: 'Was enjoying dinner at table 7 when the chef collapsed', 
        suspicious: false 
      }
    ],
    evidence: [
      { 
        id: 'poison_vial', 
        name: 'Empty Glass Vial', 
        description: 'A small bottle hidden behind bags of flour in the pantry. It smells faintly of bitter almonds - a telltale sign of cyanide. Who had access to such a deadly substance?', 
        location: 'Dining Car Kitchen', 
        found: false 
      },
      { 
        id: 'forged_letter', 
        name: 'Resignation Letter', 
        description: 'A suspicious letter of resignation supposedly written by Chef Moreau, but the handwriting looks different from his known style. Did someone forge this to cover their tracks?', 
        location: 'Dining Car Kitchen', 
        found: false 
      },
      { 
        id: 'medical_journal', 
        name: 'Toxicology Reference', 
        description: 'A medical journal left open to a detailed page about plant-based poisons and their symptoms. Several passages about cyanide poisoning are highlighted in pencil.', 
        location: 'Dining Car Kitchen', 
        found: false 
      },
      {
        id: 'soup_recipe',
        name: 'Modified Recipe',
        description: 'Chef Moreau\'s soup recipe with handwritten additions in different ink. Someone changed the ingredients list recently. What was added, and why?',
        location: 'Dining Car Kitchen',
        found: false
      }
    ],
    solution: 'sous_chef',
    completed: false
  },

  // Carriage 3: The Missing Passenger (Steampunk Era)
  {
    id: 'missing_passenger',
    title: 'The Missing Passenger Mystery',
    description: 'Mrs. Adelaide Thornfield, a respected governess traveling to her new employment, has vanished without a trace. Her compartment shows signs of a struggle, but there\'s no evidence she left the train. With no stops scheduled until London, where could she have gone? Time is running out to solve this puzzling disappearance.',
    carriageNumber: 3,
    suspects: [
      {
        id: 'mysterious_gentleman',
        name: 'Baron Von Reichenbach',
        description: 'A foreign nobleman with an unclear past who boarded at the last station. He\'s been asking suspicious questions about Mrs. Thornfield and was seen near her compartment multiple times.',
        alibi: 'Claims he was in the smoking car playing cards with other gentlemen',
        suspicious: true
      },
      {
        id: 'worried_mother',
        name: 'Mrs. Catherine Whitmore',
        description: 'A concerned mother whose teenage daughter was under Mrs. Thornfield\'s care at her previous position. She blames the governess for her daughter\'s rebellious behavior and recent troubles.',
        alibi: 'Was writing letters in the ladies\' lounge until very late',
        suspicious: false
      },
      {
        id: 'train_porter',
        name: 'Samuel Fletcher',
        description: 'The night porter responsible for this section of the train. He has keys to all compartments and knowledge of passenger movements. Recently received notice that his position will be eliminated next month.',
        alibi: 'Making his regular rounds checking on passenger needs',
        suspicious: false
      }
    ],
    evidence: [
      {
        id: 'torn_dress',
        name: 'Fragment of Blue Dress',
        description: 'A piece of fine blue fabric caught on the window latch of Mrs. Thornfield\'s compartment. The material matches the dress she was last seen wearing.',
        location: 'Passenger Compartment 12',
        found: false
      },
      {
        id: 'foreign_coin',
        name: 'Foreign Gold Coin',
        description: 'A valuable coin from Eastern Europe found under the seat. Its rarity suggests it belongs to someone of significant wealth or noble status.',
        location: 'Passenger Compartment 12',
        found: false
      },
      {
        id: 'threatening_letter',
        name: 'Anonymous Threat',
        description: 'A menacing letter warning Mrs. Thornfield to "stay away from what doesn\'t belong to you." The handwriting is disguised but the paper is expensive.',
        location: 'Passenger Compartment 12',
        found: false,
        piecesTogether: false
      },
      {
        id: 'hidden_diary',
        name: 'Secret Journal',
        description: 'Mrs. Thornfield\'s private diary hidden behind a loose panel. The final entry mentions "discovering a terrible secret" and fearing for her safety.',
        location: 'Passenger Compartment 12',
        found: false
      }
    ],
    solution: 'mysterious_gentleman',
    completed: false
  }
];

// Function to get mystery by carriage number
export const getMysteryByCarriage = (carriageNumber: number): Mystery | null => {
  return mysteriesDatabase.find(mystery => mystery.carriageNumber === carriageNumber) || null;
};

// Function to get mysteries by game phase
export const getMysterisByPhase = (phase: 'steampunk' | 'space' | 'cyborg'): Mystery[] => {
  const phaseRanges = {
    steampunk: [1, 2, 3, 4, 5],
    space: [6, 7, 8],
    cyborg: [9, 10]
  };
  
  return mysteriesDatabase.filter(mystery => 
    phaseRanges[phase].includes(mystery.carriageNumber)
  );
};

// Function to get random mystery vocabulary for educational purposes
export const getMysteryVocabulary = (mystery: Mystery): string[] => {
  const vocabulary = [];
  
  // Extract key terms from mystery description
  const descriptionWords = mystery.description.toLowerCase().match(/\b\w{6,}\b/g) || [];
  vocabulary.push(...descriptionWords.slice(0, 3));
  
  // Add suspect-related vocabulary
  mystery.suspects.forEach(suspect => {
    const suspectWords = suspect.description.toLowerCase().match(/\b\w{6,}\b/g) || [];
    vocabulary.push(...suspectWords.slice(0, 2));
  });
  
  // Add evidence-related vocabulary
  mystery.evidence.forEach(evidence => {
    const evidenceWords = evidence.description.toLowerCase().match(/\b\w{6,}\b/g) || [];
    vocabulary.push(...evidenceWords.slice(0, 2));
  });
  
  // Remove duplicates and return unique vocabulary
  return [...new Set(vocabulary)].slice(0, 10);
};