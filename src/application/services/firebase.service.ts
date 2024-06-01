import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Database, Reference } from 'firebase-admin/database';

@Injectable()
export class FirebaseService {
  private database: Database;
  private insultsRef: Reference;
  private whitelistRef: Reference;
  private adminListRef: Reference;
  private welcomeMessagesRef: Reference;

  init() {
    this.database = admin.database();
    this.insultsRef = this.database.ref('insults');
    this.whitelistRef = this.database.ref('whitelist');
    this.adminListRef = this.database.ref('adminList');
    this.welcomeMessagesRef = this.database.ref('welcomeMessages');
  }

  getWhiteList(): Promise<any[]> {
    this.init();
    return this.whitelistRef.once('value').then((snapshot) => {
      return Object.values(snapshot?.val());
    });
  }

  addOneToWhiteList(item: string): Promise<any> {
    this.init();
    return this.whitelistRef.push(item).then();
  }

  getAdminList(): Promise<any[]> {
    this.init();
    return this.adminListRef.once('value').then((snapshot) => {
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
