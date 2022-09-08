import { Inject, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { FirestoreService } from '../firestore/firestore.service'

@Injectable()
export class UserService {
  private collectionName = 'users'

  constructor(
    @Inject(FirestoreService)
    private readonly firestoreService: FirestoreService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.firestoreService.createDoc(this.collectionName, createUserDto)
  }

  findAll() {
    return this.firestoreService.getDocs(this.collectionName)
  }

  async findOne(id: string) {
    const [first] = await this.firestoreService.getDocsByField(
      this.collectionName,
      'userId',
      id,
    )
    return first
  }

  remove(id: string) {
    return this.firestoreService.deleteDocByField(
      this.collectionName,
      'userId',
      id,
    )
  }
}
