function buildDatabases(corpus, n){
  var databaseDocs = [];
  var databaseGrams = {};
  var gram = n;
  
  for(var i=0;i<corpus.length;i++){
    var current = corpus[i];
    var temp = [];
    for(var j=0;j<(current.length-gram+1);j++){
      //Array.prototype.push.apply(db,[current.substring(j,j+gram)]);
      //var segment = 
      var currentNGram = current.substring(j,j+gram);
      if (databaseGrams[currentNGram] === undefined){
        databaseGrams[currentNGram] = [i];
      } else {
        Array.prototype.push.apply(databaseGrams[currentNGram],[i]);
      }
      Array.prototype.push.apply(temp,[currentNGram]);
    }
    Array.prototype.push.apply(databaseDocs,[temp]);
  }
  
  return {databaseGrams:databaseGrams, databaseDocs:databaseDocs, corpus:corpus};
}

function getNGrams(input, n){
  var current = input;
  var output = [];
  for(var j=0;j<(current.length-n+1);j++){
    Array.prototype.push.apply(output, [current.substring(j,j+n)]);
  }
  return output;
}

function getRelevantItems(inputNGrams,databaseGrams){
  console.log(JSON.stringify(inputNGrams));
  var output = {};
  for(var i=0;i<inputNGrams.length;i++){
    //console.log(i);
    //console.log(databaseGrams[inputNGrams[i]]);
    var current = databaseGrams[inputNGrams[i]];
    if(current !== undefined){
      for(var j=0; j<current.length;j++){
        var id = output[current[j]];
        if(id === undefined){
          output[current[j]] = 1;
        } else {
          output[current[j]] += 1;
        }
      }
    }
  }
  var finalOutput = [];
  for(var doc in output){
    Array.prototype.push.apply(finalOutput,[[parseInt(doc),output[doc]]]);
    //console.log(temp);
  }
  return finalOutput;
}

function getMostRelevantItems(relevantItems, most){
  if((most <= 0) || (relevantItems.length <= most)){
    return relevantItems;
  } else {    
    relevantItems.sort(function(a,b){return b[1] - a[1];});
    return relevantItems.slice(0,most);
  } 
}

function getHighestScoresItems(items, most){
  if((most <= 0) || (items.length <= most)){
    return items;
  } else {    
    items.sort(function(a,b){return b[2] - a[2];});
    return items.slice(0,most);
  } 
}

function getScores(relevantItems,inputGrams,databases, showMatchedGrams){
  var databaseDocs = databases.databaseDocs;
  var corpus = databases.corpus;
  var output = [];
  for(var j = 0; j<relevantItems.length;j++){
    var doc = relevantItems[j][0];
  //for (var property in relevantItems) {
    //if (relevantItems.hasOwnProperty(property)) {
      var noOfMatchedGrams = 0;
      var matchedGrams = [];
      for(var i = 0; i<inputGrams.length;i++){
        if(databaseDocs[doc].indexOf(inputGrams[i]) !== -1){
          noOfMatchedGrams++;
          if(showMatchedGrams){
            Array.prototype.push.apply(matchedGrams,[inputGrams[i]]);
          }
        }
      }
      Array.prototype.push.apply(output, [[doc, corpus[doc], (noOfMatchedGrams * 2) / (inputGrams.length + databaseDocs[doc].length), matchedGrams]]);
    //}
  //}
  }
  return output;
}

function search(input,databases,most,highest){
  var output = getNGrams(input, 2); //Convert the input into an array of ngrams
  var docs = getRelevantItems(output, databases.databaseGrams); //Find relevant docs from corpus
  var mostRelevant = getMostRelevantItems(docs, most); //Find the most relevant ones; Not required if most <= 0
  var scores = getScores(mostRelevant, output, databases, false); //Only relevant ones require similarity calculation
  var highestScores = getHighestScoresItems(scores, highest);
  return {inputNGrams: output, relevantItems: docs, mostRelevantItems: mostRelevant, scores:highestScores};
}