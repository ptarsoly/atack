// run as sudo
// require necessary sub-directories
const payment = require('./payment/index.js');
const kiosk = require('./paymentKiosk/index.js');

//require necessary credentials
const config = require('./configRedis.json');
const authNetCreds = require('./configAuthNet.json');

//require authorize.net stuff
var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;

let baseInvoiceNum = 12345;

//setup redis
var redis = require('redis');
pub = redis.createClient(config),
    sub = redis.createClient(config);
const DONATIONS_INFO = "shellhacks.authorizedDonations";

sub.on("subscribe", function (channel, count) {
    console.log("subscribed");
});

payment.on('number', (data) => {
    console.log(data);
    console.log("Running Authorization...");
    var authResponse = authorize(data, kiosk.moneyCount, (response)=>{
        console.log(response.messages.resultCode);
        if(response.messages.resultCode != "Error") {
            console.log("Publishing the donation of "+kiosk.moneyCount+" dollars.");
            pub.publish(DONATIONS_INFO, JSON.stringify({
                "id":response.transactionResponse.transId,
                "amtDonated":kiosk.moneyCount
            }));
        }
        else {
            console.log("likely identical transaction issue");
        }
    });
    // if success, publish it over shellhacks.authorize
});

sub.subscribe(DONATIONS_INFO);

function authorize(cardInfo, amount, cb) {

    // Initiate the credit card authentication
    var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(authNetCreds.apiLoginKey);
    merchantAuthenticationType.setTransactionKey(authNetCreds.transactionKey);

    var creditCard = new ApiContracts.CreditCardType();
    // Card-specific info
    creditCard.setCardNumber(cardInfo);
    creditCard.setExpirationDate('2022-09');
    creditCard.setCardCode('000');

    var paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    var orderDetails = new ApiContracts.OrderType();

    orderDetails.setInvoiceNumber('INV-'+(baseInvoiceNum+Math.floor(Math.random()*100)));
    orderDetails.setDescription('Donation');

    var transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHONLYTRANSACTION);
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(amount); //TODO: fix this
    transactionRequestType.setOrder(orderDetails);

    var createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    //pretty print request
    //console.log(JSON.stringify(createRequest.getJSON(), null, 2));

    var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

    console.log('request sent');
    let response;

    ctrl.execute(function () {

        var apiResponse = ctrl.getResponse();

        response = new ApiContracts.CreateTransactionResponse(apiResponse);

        //console.log(JSON.stringify(response, null, 2));

        return cb(response);

        //pretty print response
		/*console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				if(response.getTransactionResponse().getMessages() != null){
					console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
					console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
					console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
					console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
				}
				else {
					console.log('Failed Transaction.');
					if(response.getTransactionResponse().getErrors() != null){
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
				}
			}
			else {
				console.log('Failed Transaction.');
				if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
				
					console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
					console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
				}
				else {
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
		}
		else {
			console.log('Null Response.');
		}*/
    });

    //return response;
}