import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common'
import * as firebaseAdmin from 'firebase-admin'
import firebaseConfig from '../firestore/firebase-config'

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  private app: firebaseAdmin.app.App

  constructor() {
    this.app = firebaseAdmin.initializeApp(firebaseConfig)
  }

  async use(req: any, _res: any, next: () => void) {
    const token = req.headers.authorization

    if (token) {
      try {
        await this.app.auth().verifyIdToken(token.replace('Bearer ', ''))

        next()
      } catch (error: any) {
        console.log('token error', error)
        throw new UnauthorizedException()
      }
    } else {
      throw new UnauthorizedException()
    }
  }
}
