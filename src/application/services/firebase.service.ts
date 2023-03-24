import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Database, Reference } from 'firebase-admin/database';

@Injectable()
export class FirebaseService {
  private database: Database;
  private whitelistRef: Reference;

  init() {
    this.database = admin.database();
    this.whitelistRef = this.database.ref('whitelist');
  }

  getWhiteList(): Promise<any> {
    this.init();
    return this.whitelistRef.once('value').then((snapshot) => {
      return snapshot.val();
    });
  }
}
