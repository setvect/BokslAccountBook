import { Repository } from 'typeorm';
import { MemoEntity } from '../entity/Entity';

export default class MemoRepository extends Repository<MemoEntity> {}
