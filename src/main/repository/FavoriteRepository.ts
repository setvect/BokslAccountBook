import { Repository } from 'typeorm';
import { FavoriteEntity } from '../entity/Entity';

export default class FavoriteRepository extends Repository<FavoriteEntity> {}
