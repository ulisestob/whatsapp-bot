import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Database, Reference } from 'firebase-admin/database';

@Injectable()
export class FirebaseService {
  private database: Database;
  private insultsRef: Reference;
  private whitelistRef: Reference;
  private welcomeMessagesRef: Reference;

  init() {
    this.database = admin.database();
    this.insultsRef = this.database.ref('insults');
    this.whitelistRef = this.database.ref('whitelist');
    this.welcomeMessagesRef = this.database.ref('welcomeMessages');
  }

  getWhiteList(): Promise<any[]> {
    this.init();
    return this.whitelistRef.once('value').then((snapshot) => {
      return snapshot.val();
    });
  }

  getWelcomeMessages(): Promise<any[]> {
    this.init();
    return this.welcomeMessagesRef.once('value').then((snapshot) => {
      return snapshot.val();
    });
  }

  getInsults(): Promise<any[]> {
    this.init();
    return this.insultsRef.once('value').then((snapshot) => {
      return snapshot.val();
    });
  }
}
