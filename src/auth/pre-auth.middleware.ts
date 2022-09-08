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

  async use(req: any, res: any, next: () => void) {
    const token = req.headers.authorization
    console.log('header token:', token)

    if (token) {
      try {
        const decodedToken = await this.app
          .auth()
          .verifyIdToken(token.replace('Bearer ', ''))

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
