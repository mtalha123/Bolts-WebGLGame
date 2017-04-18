define(['Third Party/seedrandom'], function(seedrandom){
    var rnd = seedrandom("1", {global: true});
    
    return { 
       // Returns a random integer between min (included) and max (excluded)
       getRandomInt: function(min, max) {
           return Math.floor(Math.random() * (max - min)) + min;
       },
       // Returns a random number between min (inclusive) and max (exclusive)
       getRandomArbitrary: function(min, max) {
           return Math.random() * (max - min) + min;
       },
       // Returns a random integer between min (included) and max (included)
       getRandomIntInclusive: function(min, max) {
           return Math.floor(Math.random() * (max - min + 1)) + min;
       }
   }; 
});