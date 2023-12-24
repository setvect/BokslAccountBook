import { Repository } from 'typeorm';
import { UserEntity } from '../entity/Entity';

export default class UserRepository extends Repository<UserEntity> {}
