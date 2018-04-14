import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Web3Service } from './web3.service'

const contract = require('truffle-contract');
const metaincoinArtifacts = require('../../build/contracts/MetaCoin.json');
const notaryArtifacts = require('../../build/contracts/Notary.json');


@Injectable()
export class MetaCoinService {

	MetaCoin = contract(metaincoinArtifacts);
	Notary = contract(notaryArtifacts);

  constructor(
  	private web3Ser: Web3Service,
  	) { 
  	// Bootstrap the MetaCoin abstraction for Use
		this.MetaCoin.setProvider(web3Ser.web3.currentProvider);
		this.Notary.setProvider(web3Ser.web3.currentProvider);
	

	}
	

	
	

  getBalance(account): Observable<number> {
  	let meta;

  	return Observable.create(observer => {
  		this.MetaCoin
  		  .deployed()
  		  .then(instance => {
  		    meta = instance;
          //we use call here so the call doesn't try and write, making it free
  		    return meta.getBalance.call(account, {
  		      from: account
  		    });
  		  })
  		  .then(value => {
  		    observer.next(value)
  		    observer.complete()
  		  })
  		  .catch(e => {
  		    console.log(e);
  		    observer.error(e)
  		  });
  	})
  }

  sendCoin(from, to, amount): Observable<any>{

  	let meta;
  	return Observable.create(observer => {
  	  this.MetaCoin
  	    .deployed()
  	    .then(instance => {
  	      meta = instance;
  	      return meta.sendCoin(to, amount, {
  	        from: from
  	      });
  	    })
  	    .then(() => {
  	      observer.next()
  	      observer.next()
  	    })
  	    .catch(e => {
  	    	console.log(e);
  	      observer.error(e)
  	    });
  	})
	}
	
	createContract(from,address1, address2, hash): Observable<any>{

  	let meta;
  	return Observable.create(observer => {
  	  this.Notary
  	    .deployed()
  	    .then(instance => {
					meta = instance;
					/*
					meta.events.NewRecordCreated({},(error,data) =>{
										if (error)
						console.log("Error: " + error);
					else 
						console.log("Log data: " + data);
					});*/
					let array: number[] = [address1,address2]
  	      return meta.createRecord(hash,array,2523705388,{
						from:from
					});
  	    })
  	    .then(value => {
  	      observer.next(value)
  	      //observer.next()
  	    })
  	    .catch(e => {
  	    	console.log(e);
  	      observer.error(e)
  	    });
  	})
	}
	
	verify(from,recordId, hash): Observable<any>{

  	let meta;
  	return Observable.create(observer => {
  	  this.Notary
  	    .deployed()
  	    .then(instance => {
					meta = instance;
  	      return meta.verify(recordId,hash,{
						from:from
					});
  	    })
  	    .then(value => {
  	      observer.next(value)
  	      //observer.next()
  	    })
  	    .catch(e => {
  	    	console.log(e);
  	      observer.error(e)
  	    });
  	})
  }

}
