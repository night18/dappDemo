import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import payontime_artifacts from './lib/Payontime.json';
import './main.html';

var payontime = web3.eth.contract(payontime_artifacts);
var bytecode = "60606040526040516020806102a4833981016040528080519060200190919050505b3460028190555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc6002549081150290604051809050600060405180830381858888f1935050505015156100cd57fe5b5b505b6101c5806100df6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063a0fadd9714610046578063c5d49bed14610098575bfe5b341561004e57fe5b6100566100ea565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100a057fe5b6100a8610110565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561016f5760006000fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505b5b905600a165627a7a72305820762bdc9733f5a27ba728b8ae9bc54a3f897cf0c65b16ad5543c4b925ea58c5d90029";

Template.sendEther.onCreated(
	function helloOnCreated() {
  		this.start_balance = new ReactiveVar(0);
  		this.end_balance = new ReactiveVar(0);
	}
);

Template.sendEther.helpers({
  currentBlock(){
	 return EthBlocks.latest.number;
  },
  startBalance(){
  	return Template.instance().start_balance.get();
  },
  endBalance(){
  	return Template.instance().end_balance.get();
  },
});

Template.sendEther.events({
  'click #send'(event, instance) {
    let sender = web3.eth.accounts[0];
    let receiver = $('#receiver').val();
    let eth_amount = $('#amount').val();
    let amount = web3.toWei(eth_amount, "ether");

    web3.eth.getBalance(receiver, function(error,result){
      if(!error){
        console.log("Before transfer: " + result);
        instance.start_balance.set(web3.fromWei(result, "ether"));
      }else{
        console.log(error);
      }
    });

    //deploy new contract, the callback function will execute twice
    var newContract = payontime.new(receiver,{data:bytecode, from:sender, value:amount},function(err,result){
      if(!err){
        console.log(newContract);
        if(!result.address) {
           console.log(result.transactionHash); // The hash of the transaction, which deploys the contract
       // check address on the second call (contract deployed)
        } else {
          var addr = result.address;
          console.log(addr);
          web3.eth.getBalance(receiver, function(error,result){
            if(!error){
              console.log("After transfer: " + result);
              instance.end_balance.set(web3.fromWei(result, "ether"));
            }else{
              console.log(error);
            }
          });
        }
      }else{
        console.log(err);
      }
    });  
  }
});
