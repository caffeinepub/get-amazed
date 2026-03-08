import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Random "mo:core/Random";
import Map "mo:core/Map";

actor {
  type Category = { #Science; #History; #Nature; #MindBlowing };

  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      switch (category1, category2) {
        case (#Science, #Science) { #equal };
        case (#Science, _) { #less };
        case (#History, #Science) { #greater };
        case (#History, #History) { #equal };
        case (#History, _) { #less };
        case (#Nature, #MindBlowing) { #less };
        case (#Nature, #Nature) { #equal };
        case (#Nature, _) { #greater };
        case (#MindBlowing, #MindBlowing) { #equal };
        case (#MindBlowing, _) { #greater };
      };
    };
  };

  type Fact = {
    id : Nat;
    text : Text;
    category : Category;
  };

  let facts = Map.empty<Nat, Fact>();
  var nextId = 0;

  func randomNumber(range : Nat) : async Nat {
    let random = Random.crypto();
    await* random.natRange(0, range);
  };

  public shared ({ caller }) func getRandomFact(category : ?Category) : async Fact {
    let filteredFacts = facts.values().toArray().filter(
      func(fact) {
        switch (category) {
          case (null) { true };
          case (?cat) { fact.category == cat };
        };
      }
    );

    if (filteredFacts.size() == 0) { Runtime.trap("No facts found for the given category") };

    let index = await randomNumber(filteredFacts.size());
    filteredFacts[index];
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    [#Science, #History, #Nature, #MindBlowing].sort();
  };

  public query ({ caller }) func getAllFacts(category : ?Category) : async [Fact] {
    facts.values().toArray().filter(
      func(fact) {
        switch (category) {
          case (null) { true };
          case (?cat) { fact.category == cat };
        };
      }
    );
  };

  public query ({ caller }) func getFact(id : Nat) : async Fact {
    switch (facts.get(id)) {
      case (null) { Runtime.trap("Fact does not exist ") };
      case (?fact) { fact };
    };
  };

  public shared ({ caller }) func addFact(text : Text, category : Category) : async Fact {
    let fact : Fact = {
      id = nextId;
      text;
      category;
    };
    facts.add(nextId, fact);
    nextId += 1;
    fact;
  };

  // Pre-populate facts
  public shared ({ caller }) func initialize() : async () {
    let initialFacts : [Fact] = [
      // Science Facts
      { id = 0; text = "The speed of light is 299,792,458 meters per second."; category = #Science },
      { id = 1; text = "A teaspoon of neutron star would weigh about 6 billion tons."; category = #Science },
      { id = 2; text = "The human body contains enough carbon to fill 9,000 'lead' pencils."; category = #Science },
      { id = 3; text = "Water can exist in all three states (solid, liquid, gas) at the same time in a process called 'triple point'."; category = #Science },
      { id = 4; text = "There are more stars in the universe than grains of sand on all the world's beaches."; category = #Science },
      { id = 5; text = "The Eiffel Tower is 15 cm taller in summer due to thermal expansion."; category = #Science },
      { id = 6; text = "The strongest muscle in the human body is the masseter (jaw muscle)."; category = #Science },
      { id = 7; text = "Bananas are naturally radioactive."; category = #Science },
      { id = 8; text = "A bolt of lightning contains enough energy to toast 100,000 slices of bread."; category = #Science },
      { id = 9; text = "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs."; category = #Science },
    ];

    let historyFacts : [Fact] = [
      { id = 10; text = "The Great Wall of China is not visible from space with the naked eye."; category = #History },
      { id = 11; text = "Oxford University is older than the Aztec Empire."; category = #History },
      { id = 12; text = "Cleopatra lived closer in time to the moon landing than to the construction of the pyramids."; category = #History },
      { id = 13; text = "The shortest war in history lasted 38 minutes between Britain and Zanzibar in 1896."; category = #History },
      { id = 14; text = "President Abraham Lincoln was a licensed bartender."; category = #History },
      { id = 15; text = "Walt Disney holds the record for most Oscar wins with 22."; category = #History },
      { id = 16; text = "The guillotine was last used in France in 1977."; category = #History },
      { id = 17; text = "Leonardo da Vinci could write with one hand and draw with the other at the same time."; category = #History },
      { id = 18; text = "The Vatican City is the smallest country in the world"; category = #History },
      { id = 19; text = "The first computer mouse was made of wood."; category = #History },
    ];

    let natureFacts : [Fact] = [
      { id = 20; text = "A single elephant tooth can weigh as much as 6 pounds."; category = #Nature },
      { id = 21; text = "Octopuses have three hearts."; category = #Nature },
      { id = 22; text = "The blue whale is the largest animal ever known to have existed."; category = #Nature },
      { id = 23; text = "Some bamboo species can grow almost a meter in one day."; category = #Nature },
      { id = 24; text = "The Amazon rainforest produces more than 20% of the world's oxygen supply."; category = #Nature },
      { id = 25; text = "A group of flamingos is called a 'flamboyance'."; category = #Nature },
      { id = 26; text = "The heart of a shrimp is located in its head."; category = #Nature },
      { id = 27; text = "Koalas have fingerprints that are nearly identical to humans."; category = #Nature },
      { id = 28; text = "A flock of ravens is called an 'unkindness'."; category = #Nature },
      { id = 29; text = "Turritopsis dohrnii, a jellyfish species, is considered biologically immortal."; category = #Nature },
    ];

    let mindBlowingFacts : [Fact] = [
      { id = 30; text = "If you fold a piece of paper 42 times, it would reach the moon."; category = #MindBlowing },
      { id = 31; text = "The Earth weighs about 81 times more than the moon."; category = #MindBlowing },
      { id = 32; text = "Every two minutes, we take more pictures than all of humanity did in the 1800s."; category = #MindBlowing },
      { id = 33; text = "An adult human has fewer bones than a baby. (206 vs. ~270)"; category = #MindBlowing },
      { id = 34; text = "The odds of shuffling a deck of cards into perfect order are about 1 in 8x10^67."; category = #MindBlowing },
      { id = 35; text = "If the history of Earth was compressed into 24 hours, humans would appear at 11:59 PM"; category = #MindBlowing },
      { id = 36; text = "There are more possible iterations of a game of chess than atoms in the observable universe."; category = #MindBlowing },
      { id = 37; text = "A day on Venus is longer than its year."; category = #MindBlowing },
      { id = 38; text = "You share 50% of your DNA with bananas."; category = #MindBlowing },
      { id = 39; text = "If you spell out numbers, you won't use the letter 'A' until you reach one thousand."; category = #MindBlowing },
    ];

    let moreScienceFacts : [Fact] = [
      { id = 40; text = "The human nose can detect over 1 trillion different scents."; category = #Science },
      { id = 41; text = "Dolphins have names for each other."; category = #Science },
      { id = 42; text = "The Eiffel Tower can be 15 cm taller during hot days."; category = #Science },
      { id = 43; text = "A group of crows is called a 'murder'."; category = #Science },
      { id = 44; text = "The human eye can distinguish about 10 million different colors."; category = #Science },
    ];

    let moreHistoryFacts : [Fact] = [
      { id = 45; text = "The largest pyramid in the world is not in Egypt but in Mexico."; category = #History },
      { id = 46; text = "Napoleon was once attacked by a horde of bunnies."; category = #History },
      { id = 47; text = "The first oranges weren’t orange, they were green."; category = #History },
      { id = 48; text = "The shortest war in history lasted only 38 minutes."; category = #History },
      { id = 49; text = "Albert Einstein never wore socks."; category = #History },
    ];

    let moreNatureFacts : [Fact] = [
      { id = 50; text = "Cows have best friends and can become stressed when separated."; category = #Nature },
      { id = 51; text = "Some turtles can breathe through their butts."; category = #Nature },
      { id = 52; text = "The fingerprints of koalas are so similar to humans that they can taint crime scenes."; category = #Nature },
      { id = 53; text = "A group of owls is called a 'parliament'."; category = #Nature },
      { id = 54; text = "Sloths can hold their breath for up to 40 minutes."; category = #Nature },
    ];

    let moreMindBlowingFacts : [Fact] = [
      { id = 55; text = "There are more possible iterations of a game of chess than there are atoms in the observable universe."; category = #MindBlowing },
      { id = 56; text = "If you could fold a piece of paper 42 times, it would reach the moon."; category = #MindBlowing },
      { id = 57; text = "The odds of shuffling a deck of cards into perfect order are about 1 in 8x10^67."; category = #MindBlowing },
      { id = 58; text = "A day on Venus is longer than its year."; category = #MindBlowing },
      { id = 59; text = "If you spell out numbers, you won’t use the letter 'A' until you reach one thousand."; category = #MindBlowing },
    ];

    let allFacts = initialFacts.concat(historyFacts).concat(natureFacts).concat(mindBlowingFacts).concat(moreScienceFacts).concat(moreHistoryFacts).concat(moreNatureFacts).concat(moreMindBlowingFacts);

    for (fact in allFacts.values()) {
      facts.add(fact.id, fact);
      nextId := fact.id + 1;
    };
  };
};
