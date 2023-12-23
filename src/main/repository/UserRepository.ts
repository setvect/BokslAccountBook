import { Repository } from 'typeorm';
import User from '../entity/Entity';

export default class UserRepository extends Repository<User> {}
