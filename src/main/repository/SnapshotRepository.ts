import { Repository } from 'typeorm';
import { SnapshotEntity } from '../entity/Entity';

export default class SnapshotRepository extends Repository<SnapshotEntity> {}
