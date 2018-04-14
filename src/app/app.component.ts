import { Component, HostListener, NgZone } from '@angular/core';

import {Web3Service, MetaCoinService} from '../services/services'

import { canBeNumber } from '../util/validation';

import * as CryptoJS from "crypto-js"
import * as sha1 from "js-sha1"

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  // TODO add proper types these variables
  account: any;
  accounts: any;

  balance: number;
  sendingAmount: number;
  //recipientAddress: string;
  address1: string;
  address2: string;
  status: string;
  fileChecksum: string;
  fileChecksumNum: number;
  canBeNumber = canBeNumber;
  recordId: number;
  recordIdToCheck: number;
  fileName: string;
  isUploaded:boolean = false;
  isDone:boolean = false;

  constructor(
    private _ngZone: NgZone,
    private web3Service: Web3Service,
    private metaCoinService: MetaCoinService,
    ) {
    console.log(CryptoJS.SHA256("message").toString());
    this.onReady();
  }

  changeListener($event) : void {
    
    //console.log($event.srcElement.value);
    this.readThis($event.target,this);
    $event.srcElement.value = "";
  }

  readThis(inputValue: any, self) : void {
    var file:File = inputValue.files[0]; 
    var myReader:FileReader = new FileReader();
    this.fileName = file.name;
    this.isUploaded = true;
    console.log(file);
   
    myReader.onloadend = function(e){
      // you can perform an action with readed data here
      //console.log(CryptoJS.SHA256(myReader.result).toString());
      self.fileChecksum = sha1(myReader.result);
      self.fileChecksumNum = parseInt(self.fileChecksumNum,16);
      //console.log(self.fileChecksumNum);
      console.log(self.fileChecksum);
     // console.log(sha1(myReader.result));
    }
    myReader.readAsArrayBuffer(file);
  }

  onReady = () => {

    // Get the initial account balance so it can be displayed.
    this.web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
        this.refreshBalance()
      );
    }, err => alert(err))

  };

  refreshBalance = () => {
    this.metaCoinService.getBalance(this.account)
      .subscribe(value => {
        this.balance = value
      }, e => {this.setStatus('Error getting balance; see log.')})
  };

  setStatus = message => {
    this.status = message;
  };

  createContract = (myform) => {
    this.setStatus('Initiating transaction... (please wait)');

    this.metaCoinService.createContract(this.account,this.address1, this.address2, this.fileChecksumNum)
      .subscribe((msg) =>{
        this.setStatus('Transaction complete!');
        myform.reset();
        this.fileName ="";
        this.recordId = msg.logs[0].args.recordId.c[0];
        this.isDone = true;
        //console.log();
        //console.log(msg.logs[0]);
      }, e => this.setStatus('Error sending coin; see log.'))
  };

  verify = () => {
    this.setStatus('Verifying...');

    this.metaCoinService.verify(this.account,this.recordIdToCheck, this.fileChecksumNum)
      .subscribe((msg) =>{
		if(msg == true){
			this.setStatus('Verified!');
		}else{
			this.setStatus('Not verified!');
		}
       
        this.fileName ="";
        this.isUploaded =false;
        this.recordIdToCheck = null;
        console.log(msg);
        //console.log(msg.logs[0]);
      }, e => this.setStatus('Error verifying; see log.'))
  };
  /*
  sendCoin = () => {
    this.setStatus('Initiating transaction... (please wait)');

    this.metaCoinService.sendCoin(this.account, this.recipientAddress, this.sendingAmount)
      .subscribe(() =>{
        this.setStatus('Transaction complete!');
        this.refreshBalance();
      }, e => this.setStatus('Error sending coin; see log.'))
  };
  */
}
