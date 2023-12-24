import { Repository } from 'typeorm';
import { AccountEntity } from '../entity/Entity';

export default class AccountRepository extends Repository<AccountEntity> {}
