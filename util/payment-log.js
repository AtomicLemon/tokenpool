
var fs = require('fs');

var redisInterface = require('../lib/redis-interface')

console.log("Logging Payments...")


async function init()
{

   await redisInterface.init();

  var paymentLog = {};


  paymentLog.missedPayments = [];


  var balancePaymentKeyList = [];
  var balancePayments = [];


  await new Promise(function (fulfilled,rejected) {

        redisInterface.getRedisClient().keys('*',  function(err, keys){
            keys.forEach( function(key,i){
          //  if(!key.toLowerCase().endsWith('0xf13e2680a930aE3a640188afe0F94aFCeBe7023b'.toLowerCase())) return;
          //  console.log(key);


            if(key.startsWith("balance_payments")){ // get all of the keys that have balance transfer (blockchain transactions)

              balancePaymentKeyList.push(key);
            }

          });

            fulfilled();
        });



    });



    console.log("balancePaymentKeyList",balancePaymentKeyList)

  await new Promise(async function (fulfilled,rejected) {

    await asyncForEach(balancePaymentKeyList,async function(key,i){

        console.log('key',key)
          var balancePaymentList = await redisInterface.getParsedElementsOfListInRedis(key)

         
          console.log('length',balancePaymentList.length)
          for(var j=0;j<balancePaymentList.length;j++ )
          {
            var payment = balancePaymentList[j]
            balancePayments.push(payment)
          //  console.log(j);
          }


      });

      fulfilled()


  });

  console.log('balancePaymentss',balancePayments)

  paymentLog.missedPayments.push({balancePayments: balancePayments })



  var paymentLogJSON = JSON.stringify(paymentLog);

  fs.writeFile("./logs/payments-log.json", paymentLogJSON, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });

}


init();


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}