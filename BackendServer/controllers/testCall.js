// TestCall
//console.log("bin im testcall");
var testData = {test: []};

for (let index = 0; index < 100; index++) {
  testData.test.push(index);  
}

//console.log(testData);


//Return to Website
exports.testCall = (req, res) => {
  //console.log(testData);
  res.json(testData);
};
